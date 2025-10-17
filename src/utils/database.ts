import * as SQLite from 'expo-sqlite';

export interface CapturedPhoto {
  id: number;
  teacherId: string;
  filePath: string;
  capturedAt: number; // Epoch timestamp when photo was captured
  uploaded: boolean; // Whether photo has been uploaded to S3
  createdAt: number; // When record was created in database
}

class DatabaseManager {
  private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync('teacher_photos.db');
    await this.createTables(db);
    return db;
  }

  async init(): Promise<void> {
    // No need to store database connection
    console.log('Database manager initialized');
  }

  private async createTables(db: SQLite.SQLiteDatabase): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS captured_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacherId TEXT NOT NULL,
        filePath TEXT NOT NULL,
        capturedAt INTEGER NOT NULL,
        uploaded INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `;

    await db.execAsync(createTableSQL);
  }

  async savePhoto(teacherId: string, filePath: string, capturedAt: number): Promise<number> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.runAsync(
        'INSERT INTO captured_photos (teacherId, filePath, capturedAt) VALUES (?, ?, ?)',
        [teacherId, filePath, capturedAt]
      );
      return result.lastInsertRowId as number;
    } finally {
      await db.closeAsync();
    }
  }

  async getPhotosByTeacher(teacherId: string): Promise<CapturedPhoto[]> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM captured_photos WHERE teacherId = ? ORDER BY capturedAt DESC',
        [teacherId]
      );
      return result as CapturedPhoto[];
    } finally {
      await db.closeAsync();
    }
  }

  async getUnuploadedPhotos(teacherId: string): Promise<CapturedPhoto[]> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM captured_photos WHERE teacherId = ? AND uploaded = 0 ORDER BY capturedAt DESC',
        [teacherId]
      );
      return result as CapturedPhoto[];
    } finally {
      await db.closeAsync();
    }
  }

  async markAsUploaded(photoId: number): Promise<void> {
    const db = await this.getDatabase();
    
    try {
      await db.runAsync(
        'UPDATE captured_photos SET uploaded = 1 WHERE id = ?',
        [photoId]
      );
    } finally {
      await db.closeAsync();
    }
  }

  async markMultipleAsUploaded(photoIds: number[]): Promise<void> {
    const db = await this.getDatabase();
    
    try {
      const placeholders = photoIds.map(() => '?').join(',');
      await db.runAsync(
        `UPDATE captured_photos SET uploaded = 1 WHERE id IN (${placeholders})`,
        photoIds
      );
    } finally {
      await db.closeAsync();
    }
  }

  async deletePhoto(photoId: number): Promise<void> {
    const db = await this.getDatabase();
    
    try {
      await db.runAsync(
        'DELETE FROM captured_photos WHERE id = ?',
        [photoId]
      );
    } finally {
      await db.closeAsync();
    }
  }

  async deleteMultiplePhotos(photoIds: number[]): Promise<void> {
    const db = await this.getDatabase();
    
    try {
      const placeholders = photoIds.map(() => '?').join(',');
      await db.runAsync(
        `DELETE FROM captured_photos WHERE id IN (${placeholders})`,
        photoIds
      );
    } finally {
      await db.closeAsync();
    }
  }

  async getAllPhotos(): Promise<CapturedPhoto[]> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM captured_photos ORDER BY capturedAt DESC'
      );
      return result as CapturedPhoto[];
    } finally {
      await db.closeAsync();
    }
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
