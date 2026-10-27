import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonalJournalDto } from './dto/create-personal-journal.dto.js';
import { Repository } from 'typeorm';
import { PersonalJournal } from './entities/personal-journal.entity.js';
import { Emotions } from './entities/emotions.entity.js';
import { AuthService } from '../auth/auth.service.js';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PersonalJournalService {
  constructor(
    @InjectRepository(PersonalJournal)
    private readonly personalJournalRepository: Repository<PersonalJournal>,
    @InjectRepository(Emotions)
    private readonly emotionRepository: Repository<Emotions>,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreatePersonalJournalDto, userId: number) {
    const [user, emotion] = await Promise.all([
      this.authService.findUser(userId),
      this.emotionRepository.findOneBy({
        id: dto.emotion,
      }),
    ]);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!emotion) {
      throw new NotFoundException(
        'A emoção escolhida não existe em nossa base de dados',
      );
    }

    const journal = this.personalJournalRepository.create({
      content: dto.content,
      createdBy: user,
      emotion: emotion,
    });

    await this.personalJournalRepository.save(journal);
  }

  findAll(userId: number) {
    return this.personalJournalRepository.find({
      select: {
        id: true,
        createdBy: {
          id: true
        },
        createdDate: true,
        emotion: true,
      },
      relations: {
        emotion: true,
        createdBy: true,
      },
      where: {
        createdBy: {
          id: userId,
        },
      },
      order: {
        createdDate: 'DESC',
      },
    });
  }

  findOne(id: number, userId: number) {
    return this.personalJournalRepository.findOne({
      relations: {
        emotion: true,
      },
      where: {
        id: id,
        createdBy: {
          id: userId,
        },
      },
    });
  }
}
