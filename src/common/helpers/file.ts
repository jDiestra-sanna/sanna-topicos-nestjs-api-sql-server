import * as archiver from 'archiver';
import * as nodePath from 'node:path';
import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';

export const getUrlStaticFile = (path: string) => {
  if (!path) return;

  return `${process.env.URL_API}/static-files/${path}`;
};

export const getLocalUriStaticFile = (path: string) => {
  return nodePath.join(__dirname, '../../..', 'uploads', path);
};

/**
 * Comprime un directorio
 * @param sourceDir /foo/bar/files
 * @param outPath /foo/bar/files.zip
 * @returns
 */
export const zipDirectory = (sourceDir: string, outPath: string, format: 'zip' | 'tar' = 'zip'): Promise<boolean> => {
  const archive = archiver.create(format, { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => {
        console.log(err);
        reject(false);
      })
      .pipe(stream);

    stream.on('close', () => resolve(true));
    archive.finalize();
  });
};

export const existsFile = async (path: string) => {
  return fs.existsSync(path);
};

export const copyFile = async (sourcePath: string, destPath: string) => {
  fsPromises.copyFile(sourcePath, destPath);
};

export const removeFile = async (path: string) => {
  await fsPromises.unlink(path);
};

export const removeDir = async (folderPath: string) => {
  await fsPromises.rm(folderPath, { force: true, recursive: true });
};

export const createDir = async (folderPath: string) => {
  await fsPromises.mkdir(folderPath);
};
