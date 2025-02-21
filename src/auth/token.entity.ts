import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'tokens' })
export class Token extends BaseEntity {
  @Column({ default: null })
  user_id: number;

  @Column({ default: null })
  type: number;

  @Column({ default: '' })
  token: string;

  @Column({ nullable: true, type: 'datetime' })
  date_expiration: string;

  @ManyToOne(() => User, user => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
