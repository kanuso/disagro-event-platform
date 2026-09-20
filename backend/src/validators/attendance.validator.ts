import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const lineServiceSchema = z.object({
  serviceId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

const lineProductSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

export const createAttendanceSchema = z
  .object({
    client: clientSchema,
    services: z.array(lineServiceSchema).default([]),
    products: z.array(lineProductSchema).default([]),
  })
  .refine(
    (data) => data.services.length > 0 || data.products.length > 0,
    { message: 'Debes seleccionar al menos un servicio o producto' }
  );

export type CreateAttendanceDto = z.infer<typeof createAttendanceSchema>;