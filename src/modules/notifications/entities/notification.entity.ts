import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum NotificationState {
  ENABLED = 1,
  DISABLED = 2,
  DELETED = 0,
  READED = 3,
}

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'Usuario destinatario' })
  user_id: number;

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: '', comment: 'Datos adicionales' })
  data: string;

  @Column({ default: 1, type: 'tinyint' })
  state: NotificationState;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'datetime', default: () => 'getDate()' })
  @Index()
  date_created: string;

  @Column({ nullable: true, type: 'datetime' })
  date_updated: string;

  @Column({ nullable: true, type: 'datetime' })
  date_deleted: string;
}
