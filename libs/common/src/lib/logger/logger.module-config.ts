import type { Request, Response } from 'express';
import type { Params } from 'nestjs-pino';

import { randomUUID } from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';

type RequestWithId = Request & { id?: unknown };

function getRequestId(req: { headers: IncomingHttpHeaders; id?: unknown }): string | undefined {
  const headerValue = req.headers['x-request-id'];

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  if (headerValue) {
    return headerValue;
  }

  if (req.id === undefined || req.id === null) {
    return undefined;
  }

  return String(req.id);
}

export function createLoggerModuleConfig(isProduction = false): Params {
  return {
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      genReqId: (req) => {
        const request = req as { headers: IncomingHttpHeaders; id?: unknown };
        const requestId = getRequestId(request) ?? randomUUID();
        request.id = requestId;
        return requestId;
      },
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname,req,res',
              messageFormat:
                '[{req.requestId}] {req.method} {req.url} {res.statusCode} {responseTime}ms - {msg}',
            },
          },
      customProps: () => ({
        context: 'HTTP',
      }),
      serializers: {
        req: (req: RequestWithId) => ({
          method: req.method,
          url: req.url,
          requestId: getRequestId(req),
        }),
        res: (res: Response) => ({
          statusCode: res.statusCode,
        }),
      },
    },
  };
}
