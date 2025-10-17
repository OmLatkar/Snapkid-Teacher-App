import * as SQLite from 'expo-sqlite';

export interface CapturedPhoto {
  id: number;
  teacherId: string;
  school: string;
  branch: string;
  class: string;
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
        school TEXT NOT NULL,
        branch TEXT NOT NULL,
        class TEXT NOT NULL,
        filePath TEXT NOT NULL,
        capturedAt INTEGER NOT NULL,
        uploaded INTEGER DEFAULT 0,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `;

    await db.execAsync(createTableSQL);
    
    // Check if we need to migrate the old schema
    await this.migrateDatabase(db);
  }

  private async migrateDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      // Check if the old schema exists (without school, branch, class columns)
      const result = await db.getAllAsync("PRAGMA table_info(captured_photos)");
      const columns = result.map((col: any) => col.name);
      
      if (!columns.includes('school')) {
        console.log('Migrating database schema...');
        
        // Create a backup table with old data
        await db.execAsync(`
          CREATE TABLE captured_photos_backup AS SELECT * FROM captured_photos;
        `);
        
        // Drop the old table
        await db.execAsync(`DROP TABLE captured_photos;`);
        
        // Recreate with new schema
        await db.execAsync(`
          CREATE TABLE captured_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacherId TEXT NOT NULL,
            school TEXT NOT NULL,
            branch TEXT NOT NULL,
            class TEXT NOT NULL,
            filePath TEXT NOT NULL,
            capturedAt INTEGER NOT NULL,
            uploaded INTEGER DEFAULT 0,
            createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
          );
        `);
        
        // Migrate data from backup (with default values for new columns)
        await db.execAsync(`
          INSERT INTO captured_photos (id, teacherId, school, branch, class, filePath, capturedAt, uploaded, createdAt)
          SELECT id, teacherId, 'Unknown', 'Unknown', 'Unknown', filePath, capturedAt, uploaded, createdAt
          FROM captured_photos_backup;
        `);
        
        // Drop backup table
        await db.execAsync(`DROP TABLE captured_photos_backup;`);
        
        console.log('Database migration completed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      // If migration fails, the table will be created fresh with the new schema
    }
  }

  async savePhoto(teacherId: string, school: string, branch: string, className: string, filePath: string, capturedAt: number): Promise<number> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.runAsync(
        'INSERT INTO captured_photos (teacherId, school, branch, class, filePath, capturedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [teacherId, school, branch, className, filePath, capturedAt]
      );
      return result.lastInsertRowId as number;
    } finally {
      await db.closeAsync();
    }
  }

  async getPhotosByClass(school: string, branch: string, className: string): Promise<CapturedPhoto[]> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM captured_photos WHERE school = ? AND branch = ? AND class = ? ORDER BY capturedAt DESC',
        [school, branch, className]
      );
      return result as CapturedPhoto[];
    } finally {
      await db.closeAsync();
    }
  }

  async getUnuploadedPhotosByClass(school: string, branch: string, className: string): Promise<CapturedPhoto[]> {
    const db = await this.getDatabase();
    
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM captured_photos WHERE school = ? AND branch = ? AND class = ? AND uploaded = 0 ORDER BY capturedAt DESC',
        [school, branch, className]
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
