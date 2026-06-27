# Gilded Rose – Refactorización con Patrones de Diseño

Implementación en TypeScript del clásico kata **Gilded Rose**, aplicando los patrones **Strategy** y **Factory** para cumplir el principio **Abierto/Cerrado (OCP)** y eliminar la lógica condicional anidada del código original.

## Objetivo

- Refactorizar el código legado sin modificar la clase `Item`.
- Añadir soporte para nuevos tipos de artículos (`Conjured`) sin tocar el núcleo del sistema.
- Mantener el comportamiento exacto del original mediante pruebas (Golden Master).

## Arquitectura

- **`Item`** – clase inmutable de datos (no se toca).
- **`QualityUpdateStrategy`** – interfaz que define el contrato de actualización.
- **Estrategias concretas** – una por cada tipo de ítem:
  - `NormalStrategy`
  - `AgedBrieStrategy`
  - `SulfurasStrategy`
  - `BackstageStrategy`
  - `ConjuredStrategy` (nuevo requerimiento)
- **`StrategyFactory`** – devuelve la estrategia adecuada según el nombre del ítem.
- **`GildedRose`** – orquesta la actualización diaria delegando en la fábrica.

## Ejecución

1. Instala dependencias (si no las tienes):

```bash
npm install -D typescript ts-node @types/node
```

2. Ejecuta el ejemplo con ts-node:

```bash
npx ts-node example.ts
```

3. Si prefieres compilar a JavaScript:

```bash
npx tsc
node dist/example.js
```

## Pruebas
Las pruebas unitarias (Jest) verifican el comportamiento de cada estrategia y el snapshot de Golden Master asegura que no hay regresiones.

```bash
npm test
```

## Principios aplicados
**Responsabilidad Única (SRP)** – cada estrategia se ocupa de una única regla de negocio.

**Abierto/Cerrado (OCP)** – se pueden añadir nuevos tipos creando una nueva clase, sin modificar el código existente.

**Inversión de Dependencias (DIP)** – GildedRose depende de la abstracción QualityUpdateStrategy, no de implementaciones concretas.