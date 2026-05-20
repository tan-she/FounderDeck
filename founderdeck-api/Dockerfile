FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    supervisor \
    dcron

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    xml \
    pcntl \
    bcmath \
    gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

# ── DELETE .env so Render's environment variables take effect ──
RUN rm -f .env

# ── Clear any cached config baked during build ────────────────
RUN php artisan config:clear || true
RUN php artisan cache:clear || true
RUN php artisan route:clear || true
RUN php artisan view:clear || true

RUN composer run-script post-autoload-dump || true

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

RUN echo "* * * * * www-data php /var/www/artisan schedule:run >> /var/log/cron.log 2>&1" \
    > /etc/crontabs/www-data

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
