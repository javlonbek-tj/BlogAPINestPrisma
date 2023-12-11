import { cleanEnv, port, str } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    PORT: port(),
    DATABASE_URL: str(),
    CLIENT_URL: str(),
    API_URL: str(),
    AT_SECRET: str(),
    RT_SECRET: str(),
    AT_EXPIRATION_DATE: str(),
    RT_EXPIRATION_DATE: str(),
    NODEMAILER_USER: str(),
    NODEMAILER_PASS: str(),
  });
};

export default validateEnv;
