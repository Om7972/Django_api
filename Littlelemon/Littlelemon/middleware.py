"""
Custom middleware for request logging, error monitoring, and security headers.
"""

import logging
import time
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')
error_logger = logging.getLogger('django.request')


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Logs every API request with method, path, user, status code, and response time.
    """

    def process_request(self, request):
        request._start_time = time.monotonic()

    def process_response(self, request, response):
        # Skip static files and admin
        if request.path.startswith('/static/') or request.path.startswith('/admin/'):
            return response

        duration_ms = 0
        if hasattr(request, '_start_time'):
            duration_ms = round((time.monotonic() - request._start_time) * 1000, 2)

        user = getattr(request, 'user', None)
        user_id = user.pk if user and user.is_authenticated else 'anonymous'

        log_data = {
            'method': request.method,
            'path': request.path,
            'status': response.status_code,
            'user_id': user_id,
            'duration_ms': duration_ms,
            'ip': self._get_client_ip(request),
        }

        if response.status_code >= 400:
            logger.warning(
                'API Request %(method)s %(path)s -> %(status)s [%(duration_ms)sms] user=%(user_id)s',
                log_data
            )
        else:
            logger.info(
                'API Request %(method)s %(path)s -> %(status)s [%(duration_ms)sms] user=%(user_id)s',
                log_data
            )

        return response

    @staticmethod
    def _get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')


class ErrorMonitoringMiddleware(MiddlewareMixin):
    """
    Catches unhandled exceptions and returns structured JSON error responses.
    Logs full tracebacks for server errors.
    """

    def process_exception(self, request, exception):
        error_logger.error(
            'Unhandled exception on %s %s: %s',
            request.method,
            request.path,
            str(exception),
            exc_info=True,
            extra={
                'request_path': request.path,
                'request_method': request.method,
                'user_id': getattr(request.user, 'pk', None),
            }
        )

        from django.conf import settings
        if settings.DEBUG:
            return None  # Let Django default handler show the debug page

        return JsonResponse(
            {
                'error': 'internal_server_error',
                'message': 'An unexpected error occurred. Please try again later.',
                'status_code': 500,
            },
            status=500,
        )


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Adds production-grade security headers to every response.
    """

    def process_response(self, request, response):
        # Prevent MIME-type sniffing
        response['X-Content-Type-Options'] = 'nosniff'

        # Prevent clickjacking
        if 'X-Frame-Options' not in response:
            response['X-Frame-Options'] = 'DENY'

        # XSS protection
        response['X-XSS-Protection'] = '1; mode=block'

        # Referrer policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Permissions policy
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'

        return response
