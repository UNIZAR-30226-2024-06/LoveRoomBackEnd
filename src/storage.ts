import multer from "multer";
import path from "path";

const uploadsDirectory = path.join(__dirname, "uploads");

// Configuración de Multer para almacenar los archivos en una carpeta llamada 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDirectory);
  },
  filename: function (req, file, cb) {
    const userId = req.params.idUsuario;
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7); // Genera una cadena aleatoria
    cb(null, userId + "-" + timestamp + "-" + randomString);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 50, // limit to 50MB
};

// Filtrar los archivos para aceptar solo imágenes y videos
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true); // Aceptar el archivo
  } else {
    console.log("File type not supported:", file.mimetype);
    cb(null, false); // Rechazar el archivo
  }
};

// Configura Multer con las opciones de almacenamiento
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
});

export { uploadsDirectory, upload };
