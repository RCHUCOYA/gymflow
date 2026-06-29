# 01. Analisis del Problema

## Descripcion del problema

Muchos gimnasios medianos administran membresias, reservas, pagos, asistencias, inventario y servicios profesionales mediante hojas de calculo, mensajeria o sistemas aislados. Esto provoca perdida de informacion, duplicidad de tareas, poca visibilidad del negocio y una experiencia inconsistente para el cliente.

GymFlow propone una plataforma centralizada que permita administrar la operacion completa del gimnasio desde una interfaz web, con roles diferenciados y trazabilidad de las operaciones mas importantes.

## Problema principal

El gimnasio necesita controlar usuarios, membresias, reservas, profesionales, tienda, pagos simulados y reportes desde un solo sistema, evitando procesos manuales que generan errores operativos y poca visibilidad gerencial.

## Problemas secundarios

- Dificultad para validar si una membresia esta activa o si incluye beneficios especificos.
- Reservas duplicadas o sobrecupo en salas con capacidad limitada.
- Falta de control sobre agendas de entrenadores y nutricionistas.
- Inventario desactualizado despues de ventas.
- Historial de pagos y compras disperso.
- Baja trazabilidad de acciones administrativas.
- Reportes manuales para ventas, membresias activas, productos mas vendidos y salas mas utilizadas.

## Objetivo general

Disenar una plataforma web integral para gestionar la operacion de un gimnasio, mejorando control, automatizacion, trazabilidad y experiencia de usuarios internos y clientes.

## Objetivos especificos

- Centralizar la gestion de usuarios, roles y permisos.
- Administrar planes de membresia, beneficios, compras y renovaciones.
- Permitir reservas de salas, entrenadores y nutricionistas segun disponibilidad y reglas de negocio.
- Gestionar productos, carrito, ordenes, stock y promociones.
- Simular pagos y registrar comprobantes internos.
- Entregar metricas administrativas mediante dashboard.
- Definir una arquitectura escalable, mantenible y segura.

## Alcance

Incluye documentacion completa del producto, modelo de datos, arquitectura, API REST, seguridad, UI/UX, plan de seed, plan de pruebas y coleccion API. La implementacion futura usara Next.js, Express.js, Prisma y PostgreSQL.

## Fuera del alcance

- Pagos reales con pasarelas externas.
- Aplicaciones moviles nativas.
- Control fisico de torniquetes o hardware.
- Facturacion electronica legal.
- Integraciones contables.
- Implementacion de codigo de frontend, backend, Prisma schema o SQL en esta fase.

## Publico objetivo

- Duenos y administradores de gimnasios.
- Recepcionistas y personal operativo.
- Clientes del gimnasio.
- Entrenadores y nutricionistas.
- Reclutadores o evaluadores tecnicos que revisen el proyecto como portafolio.

## Beneficios

- Menos errores por procesos manuales.
- Mejor control de aforo, membresias y beneficios.
- Trazabilidad de pagos, reservas y acciones administrativas.
- Mejor experiencia del cliente.
- Base documental solida para implementar un producto SaaS realista.

## Justificacion del proyecto

GymFlow es un proyecto adecuado para portafolio porque combina autenticacion, autorizacion por roles, reglas de negocio, CRUDs complejos, inventario, pagos simulados, agenda, reportes, dashboard, carga de imagenes, base de datos relacional y despliegue cloud. Esto permite demostrar criterio de producto, arquitectura, modelado de datos y diseno API.

