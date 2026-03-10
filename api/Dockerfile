# expense_tracker/api/Dockerfile

# Usamos una imagen base de PHP-FPM
FROM php:8.2-fpm-alpine AS app

# Instalar extensiones de PHP y dependencias del sistema
RUN apk add --no-cache \
  libpng-dev \
  libjpeg-turbo-dev \
  icu-dev \
  autoconf \
  $PHPIZE_DEPS \
  && docker-php-ext-install pdo_mysql \
  && docker-php-ext-install gd \
  && docker-php-ext-install intl \
  && docker-php-ext-install bcmath \
  && docker-php-ext-install pdo_mysql gd \
  && docker-php-ext-enable pdo_mysql gd \
  && rm -rf /var/cache/apk/*

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copiar el código de la aplicación
WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs

# Ajustar permisos para Laravel
RUN chown -R www-data:www-data /var/www/html/storage \
  && chown -R www-data:www-data /var/www/html/bootstrap/cache \
  && chmod -R 775 /var/www/html/storage \
  && chmod -R 775 /var/www/html/bootstrap/cache

# El contenedor solo expone el puerto de PHP-FPM
EXPOSE 9000

# Este es el comando para iniciar el servicio
CMD ["php-fpm"]
