import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0)   return 'Сервер недоступен. Проверьте подключение.';
  if (err.status === 400) return err.error?.message || err.error?.title || 'Неверный запрос';
  if (err.status === 401) return 'Неверный логин или пароль';
  if (err.status === 403) return 'Нет доступа';
  if (err.status === 404) return 'Ресурс не найден';
  if (err.status === 422) return err.error?.message || 'Ошибка валидации';
  if (err.status >= 500)  return 'Ошибка сервера. Попробуйте позже.';
  return 'Произошла неизвестная ошибка';
}

export function isNetworkError(err: HttpErrorResponse): boolean {
  return err.status === 0;
}

export function isServerError(err: HttpErrorResponse): boolean {
  return err.status >= 500;
}
