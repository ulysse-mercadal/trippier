// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import axios from 'axios';
import { API_URL } from '@env';

const client = axios.create({
  baseURL: API_URL,
});

export default client;
