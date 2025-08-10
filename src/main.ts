import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	if (process.env.NODE_ENV !== 'production') {
		const config = new DocumentBuilder().setTitle('Chat').build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api', app, document);
	}

	app.use(cookieParser());
	app.enableCors({
		origin: ['add-front-url'],
		credentials: true,
	});
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Удаляет поля, не указанные в DTO
			transform: true,
		})
	);

	await app.listen(process.env.PORT || 3000);
}

bootstrap();
