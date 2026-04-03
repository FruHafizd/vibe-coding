import { Elysia } from "elysia";

export const auth = (app: Elysia) => 
  app.derive(({ headers }) => {
    const authHeader = headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { token: "" };
    }

    const token = authHeader.split(' ')[1];
    return { token: token || "" };
  });
