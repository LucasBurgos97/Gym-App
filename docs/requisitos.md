# Martin Gym Manager

## 1. Descripción del sistema

Martin Gym Manager es un sistema de gestión para un gimnasio. Su objetivo principal es facilitar al entrenador la administración de alumnos, planes, membresías, pagos y asistencias.

El sistema permitirá registrar alumnos mediante su DNI, administrar sus membresías y controlar las asistencias disponibles según el plan contratado.

También permitirá registrar clases recuperadas cuando corresponda por situaciones excepcionales, como problemas de salud del alumno o suspensión de actividades por parte del gimnasio.

---

## 2. Objetivos

Los objetivos principales del sistema son:

* Centralizar la información de los alumnos.
* Registrar y consultar el historial de membresías.
* Registrar los pagos realizados.
* Controlar las fechas de inicio y vencimiento de las membresías.
* Registrar asistencias mediante el DNI del alumno.
* Controlar la cantidad de clases disponibles.
* Registrar clases recuperadas autorizadas por el entrenador.
* Facilitar la consulta del estado actual de cada alumno.
* Mantener un historial de las operaciones realizadas.

---

## 3. Actores

El sistema contará inicialmente con dos actores principales.

### 3.1. Alumno

Es la persona que asiste al gimnasio.

El alumno será identificado principalmente mediante su número de DNI.

En la primera versión del sistema, el alumno no tendrá una cuenta de acceso propia.

### 3.2. Entrenador

Es la persona encargada de administrar el gimnasio y utilizar el sistema.

El entrenador tendrá acceso a las funciones de gestión de alumnos, pagos, membresías y asistencias.

---

## 4. Alcance del sistema

La primera versión del sistema incluirá los siguientes módulos:

### 4.1. Gestión de alumnos

El sistema permitirá:

* Registrar nuevos alumnos.
* Consultar alumnos existentes.
* Buscar alumnos mediante DNI.
* Modificar los datos de un alumno.
* Consultar el historial de un alumno.

### 4.2. Gestión de planes

El sistema permitirá definir planes de entrenamiento.

Inicialmente se contemplan:

* Plan de 3 veces por semana.
* Plan de 5 veces por semana.
* Plan libre.

Los planes estarán asociados a una cantidad de clases disponibles.

Ejemplo:

* Plan 3 veces por semana: 12 clases.
* Plan 5 veces por semana: 20 clases.
* Plan libre: cantidad ilimitada de clases.

La cantidad de clases podrá ser configurable para permitir modificaciones futuras.

### 4.3. Gestión de pagos

El sistema permitirá registrar los pagos realizados por los alumnos.

Cada pago estará asociado a:

* Un alumno.
* Una membresía.
* Una fecha.
* Un importe.

El registro del pago permitirá generar una nueva membresía.

### 4.4. Gestión de membresías

Cada vez que un alumno realice un pago correspondiente a una nueva mensualidad, se generará una nueva membresía.

Cada membresía tendrá:

* Alumno asociado.
* Plan contratado.
* Fecha de inicio.
* Fecha de vencimiento.
* Cantidad de clases incluidas.
* Cantidad de clases utilizadas.
* Estado.

La fecha de vencimiento se calculará tomando como referencia la fecha de inicio y agregando un mes calendario.

Ejemplo:

> Inicio: 12/08/2026
> Vencimiento: 12/09/2026

La fecha de vencimiento dependerá del día calendario de inicio y no de la cantidad de semanas del mes.

Las membresías anteriores se conservarán para mantener el historial del alumno.

### 4.5. Gestión de asistencias

El entrenador podrá registrar la asistencia de un alumno mediante su DNI.

El sistema deberá:

1. Buscar al alumno mediante el DNI.
2. Identificar la membresía correspondiente.
3. Verificar que la membresía se encuentre vigente.
4. Verificar que existan clases disponibles.
5. Registrar la asistencia.
6. Consumir una clase disponible.

Las asistencias quedarán registradas en el historial del alumno.

### 4.6. Gestión de clases recuperadas

El entrenador podrá registrar clases recuperadas cuando corresponda.

Las recuperaciones podrán otorgarse, entre otras situaciones, por:

* Problemas de salud del alumno.
* Suspensión de actividades del gimnasio.
* Otras situaciones excepcionales autorizadas por el entrenador.

Cada recuperación deberá registrar:

* Alumno.
* Membresía relacionada.
* Cantidad de clases recuperadas.
* Motivo.
* Fecha de registro.

Las clases recuperadas se sumarán a las clases disponibles de la membresía.

Si las clases recuperadas no son utilizadas antes del vencimiento de la membresía y el alumno renueva su membresía, las clases recuperadas pendientes podrán trasladarse a la nueva membresía.

Si el alumno no renueva, las clases recuperadas pendientes no permanecerán disponibles indefinidamente.

---

## 5. Flujo principal de asistencia

### Alumno registrado

1. El alumno llega al gimnasio.
2. El entrenador solicita el DNI.
3. El sistema busca al alumno.
4. El sistema identifica la membresía vigente.
5. El sistema verifica la disponibilidad de clases.
6. El entrenador registra la asistencia.
7. El sistema consume una clase.
8. La asistencia queda almacenada en el historial.

### Alumno nuevo

1. El alumno llega al gimnasio.
2. El entrenador solicita el DNI.
3. El sistema busca el DNI.
4. El sistema determina que el alumno no existe.
5. El entrenador registra los datos del alumno.
6. Se registra el pago.
7. Se crea la primera membresía.
8. Se registra la asistencia correspondiente.

---

## 6. Reglas de negocio

### RN-01 — Identificación del alumno

El DNI será utilizado como dato principal para localizar rápidamente a un alumno.

El DNI deberá ser único dentro del sistema.

### RN-02 — Nueva membresía

Cada nuevo pago correspondiente a una mensualidad generará una nueva membresía.

Las membresías anteriores no serán eliminadas ni sobrescritas.

### RN-03 — Fecha de vencimiento

La membresía tendrá una duración de un mes calendario.

La fecha de vencimiento conservará el día del mes correspondiente a la fecha de inicio.

Ejemplo:

> 12/08/2026 → 12/09/2026

La fecha de vencimiento no dependerá del día de la semana.

### RN-04 — Clases incluidas

La cantidad de clases disponibles dependerá del plan contratado.

Ejemplo:

> Plan 3 veces por semana → 12 clases.

> Plan 5 veces por semana → 20 clases.

> Plan libre → clases ilimitadas.

### RN-05 — Consumo de clases

Cada asistencia registrada consumirá una clase de la membresía activa.

Los planes ilimitados no tendrán límite de clases.

### RN-06 — Membresía vencida

Una membresía vencida no podrá utilizarse para registrar nuevas asistencias.

### RN-07 — Sin clases disponibles

Un alumno que haya consumido todas las clases disponibles no podrá registrar una nueva asistencia mediante esa membresía.

### RN-08 — Clases recuperadas

Las clases recuperadas serán otorgadas únicamente cuando exista una situación excepcional autorizada por el entrenador.

### RN-09 — Recuperación antes del vencimiento

Las clases recuperadas podrán utilizarse mientras la membresía correspondiente se encuentre vigente.

### RN-10 — Recuperación al renovar

Si existen clases recuperadas pendientes al momento de finalizar una membresía y el alumno renueva, dichas clases podrán trasladarse a la nueva membresía.

### RN-11 — Recuperaciones sin renovación

Si el alumno no renueva su membresía, las clases recuperadas pendientes no permanecerán disponibles indefinidamente.

### RN-12 — Historial

El sistema conservará el historial de:

* Alumnos.
* Pagos.
* Membresías.
* Asistencias.
* Recuperaciones.

---

## 7. Requisitos funcionales

### RF-01 — Registrar alumno

El entrenador podrá registrar un nuevo alumno.

### RF-02 — Consultar alumno

El entrenador podrá buscar y consultar los datos de un alumno.

### RF-03 — Buscar por DNI

El sistema permitirá localizar un alumno mediante su DNI.

### RF-04 — Modificar alumno

El entrenador podrá modificar los datos registrados de un alumno.

### RF-05 — Registrar plan

El sistema permitirá crear y configurar planes.

### RF-06 — Registrar pago

El entrenador podrá registrar un pago realizado por un alumno.

### RF-07 — Crear membresía

El sistema generará una nueva membresía asociada al pago y al plan seleccionado.

### RF-08 — Calcular vencimiento

El sistema calculará automáticamente la fecha de vencimiento de la membresía.

### RF-09 — Registrar asistencia

El entrenador podrá registrar la asistencia de un alumno mediante su DNI.

### RF-10 — Validar membresía

Antes de registrar una asistencia, el sistema deberá verificar que exista una membresía vigente.

### RF-11 — Validar clases

Antes de registrar una asistencia, el sistema deberá verificar que existan clases disponibles, excepto en planes ilimitados.

### RF-12 — Consumir clase

Al registrar una asistencia válida, el sistema deberá actualizar el consumo de clases.

### RF-13 — Registrar recuperación

El entrenador podrá registrar una recuperación de clases.

### RF-14 — Consultar recuperaciones

El entrenador podrá consultar las clases recuperadas de un alumno.

### RF-15 — Consultar historial

El entrenador podrá consultar el historial de pagos, membresías y asistencias de un alumno.

### RF-16 — Consultar vencimientos

El sistema permitirá consultar las membresías próximas a vencer y las vencidas.

---

## 8. Requisitos no funcionales

### RNF-01 — Usabilidad

La aplicación deberá ser sencilla de utilizar para el entrenador y permitir registrar una asistencia rápidamente.

### RNF-02 — Rendimiento

La búsqueda de un alumno mediante DNI deberá realizarse de forma rápida.

### RNF-03 — Seguridad

La información de los alumnos deberá almacenarse de forma segura.

### RNF-04 — Integridad de datos

El sistema deberá evitar registros inconsistentes, como asistencias asociadas a alumnos inexistentes.

### RNF-05 — Historial

Las operaciones importantes deberán conservarse para permitir consultas posteriores.

### RNF-06 — Disponibilidad

La aplicación deberá poder utilizarse desde un navegador web con conexión a Internet.

### RNF-07 — Escalabilidad

El sistema deberá estar diseñado de forma que permita incorporar nuevos gimnasios, planes y funcionalidades en futuras versiones.

---

## 9. Funcionalidades futuras

Las siguientes funcionalidades quedan fuera del alcance inicial, pero podrán incorporarse posteriormente:

* Inicio de sesión para entrenadores.
* Diferentes roles y permisos.
* Código QR para registrar asistencias.
* Lectores de código de barras.
* Notificaciones de vencimiento.
* Estadísticas y gráficos.
* Gestión de caja.
* Reportes de ingresos.
* Exportación de datos.
* Aplicación móvil para alumnos.
* Gestión de múltiples sucursales.
* Personalización con logo y nombre del gimnasio.
