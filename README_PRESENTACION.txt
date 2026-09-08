VINCULARTE — PROTOTIPO DEL SISTEMA INTERNO
===========================================

Archivos
--------
- sistema.html
- sistema.css
- sistema.js

Cómo abrirlo
------------
1. Colocá los tres archivos en la misma carpeta.
2. Abrí sistema.html en el navegador.
3. No necesita backend para la demostración.
4. Los datos que cargues se guardan en localStorage del navegador.
5. El botón "Restablecer demo" vuelve a los datos iniciales.

Qué mostrar en la presentación
------------------------------
1. Resumen del SuperAdmin.
2. Casas -> "Dar de alta una casa".
3. Usuarios -> "Dar de alta un usuario":
   PERSONA -> USUARIO -> USUARIO_CASA.
   Mostrá que un usuario puede tener varias casas y un rol por cada una.
4. Personas asistidas -> "Nueva persona asistida":
   PERSONA -> PERSONA_ASISTIDA -> ESTADIA.
5. Abrí una casa desde la tabla para mostrar el segundo nivel del sistema.
6. Mostrá Roles y permisos y Auditoría.
7. Parte diario está presentado como prototipo funcional de interfaz.

Importante
----------
Este prototipo es frontend. Sirve para validar navegación, pantallas, campos,
relaciones y reglas de negocio. No reemplaza autenticación, API ni base de datos.

Está alineado a la documentación de Etapa 1:
- SuperAdmin como administración general.
- acceso por casa;
- relación muchos-a-muchos usuario/casa y profesional/casa;
- persona como entidad general;
- estadía separada de persona asistida;
- roles y permisos iniciales;
- parte diario por casa y fecha;
- trazabilidad/auditoría como objetivo del sistema.
