import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElectricityBillModule } from './electricity-bill/electricity-bill.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConsumerDataModule } from './consumer-data/consumer-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ElectricityBillModule,
    HttpModule,
    AuthModule,
    UserModule,
    ConsumerDataModule,
    ConsumerDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
