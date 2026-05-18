FROM php:8.2-fpm

RUN apt-get update && apt-get install -y git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev

RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . /var/www

RUN composer install --no-dev --optimize-autoloader

EXPOSE 80

CMD php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host 0.0.0.0 --port $PORT
