import { GET } from './utils';

export function getUserDetail(token?: string) {
    console.log('Getting user detail...');
    return GET('user_detail/', token);
}