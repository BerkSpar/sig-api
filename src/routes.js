/* eslint-disable prettier/prettier */
import { Router } from 'express';
import scrapingController from './app/controllers/scrapingController';
const routes = new Router();

routes.get('/user', scrapingController.getDados);

export default routes;