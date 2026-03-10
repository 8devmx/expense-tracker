# expense_tracker/nginx/Dockerfile

# Usamos una imagen de Nginx ligera
FROM nginx:stable-alpine

# Eliminamos la configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra configuración
COPY nginx.conf /etc/nginx/conf.d/
