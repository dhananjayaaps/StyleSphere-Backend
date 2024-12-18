import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { ModelService } from './model.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('upload')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Roles(UserRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('model')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndAnalyze(@UploadedFile() file: Express.Multer.File, @Req() req ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const userId = req.user.userId;

    // Step 1: Forward file to Flask app for analysis
    const flaskUrl = 'http://localhost:5000/upload';
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    try {
      const flaskResponse = await axios.post(flaskUrl, formData, {
        headers: formData.getHeaders(),
      });

      const analysisResult = flaskResponse.data;

      // Step 2: Save the file locally in /uploads with timestamped name
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const savedFileName = `${path.basename(file.originalname, path.extname(file.originalname))}_${timestamp}${path.extname(file.originalname)}`;
      const savedFilePath = path.join(uploadDir, savedFileName);

      fs.writeFileSync(savedFilePath, file.buffer);

      // Step 3: Save the analysis result in the database
      const savedModel = await this.modelService.saveModelDetails(
        userId,
        savedFileName,
        analysisResult,
      );

      //delete saved model parameters valid
      if (savedModel && savedModel.parameters && savedModel.parameters.Valid) {
        delete savedModel.parameters.valid;
      }

      // Step 4: Return the result to the frontend with access link
      const fileAccessUrl = `${process.env.APP_URL}/uploads/${savedFileName}`;
      return {
        success: true,
        message: 'Model analyzed and saved successfully',
        savedModel,
        fileAccessUrl,
      };
    } catch (error) {
      console.error('Error communicating with Flask:', error.message);
      throw new Error('Failed to analyze the model');
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Create the uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique file name
    const randomNumber = Math.floor(Math.random() * 10000);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const savedFileName = `${path.basename(file.originalname, path.extname(file.originalname))}_${randomNumber}_${timestamp}${path.extname(file.originalname)}`;
    const savedFilePath = path.join(uploadDir, savedFileName);

    fs.writeFileSync(savedFilePath, file.buffer);

    const fileAccessUrl = `${process.env.APP_URL}/uploads/${savedFileName}`;

    return {
      success: true,
      message: 'Image uploaded successfully',
      fileAccessUrl,
    };
  }
}
