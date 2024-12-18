import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByGoogleId(googleId: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findByVerificationToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async markEmailAsVerified(token: string): Promise<User | undefined> {
    const user = await this.findByVerificationToken(token);
    if (user) {
      user.isVerified = true;
      user.verificationToken = null; // Clear the token after verification
      return this.usersRepository.save(user);
    }
    return undefined;
  }

  // find one by id
  async findOneById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // i need a endpoint to get total number of users , active users count, deactivated users count and list of the those users Name, email, contact, status by a role and that must be filter by the email name and the status
  async getUsersByRole(role: string, name: string, email: string, status: string) {
    const query = this.usersRepository.createQueryBuilder('user');
    const query2 = this.usersRepository.createQueryBuilder('user');

    if (role) {
      query2.where('user.roles LIKE :role', { role: `%${role}%` })
    }  

    if (role) {
      query.where('user.roles LIKE :role', { role: `%${role}%` })
    }   

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (name) {
      query.andWhere('user.firstName ILIKE :name', { name: `%${name}%` });
    }

    if (status) {
      query.andWhere('user.isActive = :status', { status: status === 'active' });
    }

    const [users, total] = await query.getManyAndCount();
    const [users2, total2] = await query2.getManyAndCount();

    const activeUsers = users2.filter(user2 => user2.isActive);
    const deactivatedUsers = users2.filter(user2 => !user2.isActive);

    return {
      total2,
      activeUsers: activeUsers.length,
      deactivatedUsers: deactivatedUsers.length,
      users: users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contact: user.contactNo,
        status: user.isActive ? 'active' : 'inactive',
      })),
    };
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  // async findOne(conditions: Partial<User>): Promise<User | undefined> {
  //   // find by user id
  //   if (conditions.id) {
  //     return this.usersRepository.findOne({ where: { id: conditions.id } });
  //   }
  // }
}
