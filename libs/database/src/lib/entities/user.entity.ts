import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'users' })
export class User {
  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;
}
