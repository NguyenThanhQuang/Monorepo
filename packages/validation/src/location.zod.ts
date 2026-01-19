import { z } from 'zod';
import { LocationType } from '@obtp/shared-types';

export const GeoPointSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z
    .tuple([z.number(), z.number()], {
      message: 'Tọa độ phải gồm [kinh độ, vĩ độ]',
    }),
});

export const CreateLocationSchema = z.object({
  name: z.string().min(1).max(200),
  province: z.string().min(1),
  district: z.string().optional(),
  fullAddress: z.string().min(1),
  location: GeoPointSchema,
  type: z.enum(
    Object.values(LocationType) as [LocationType, ...LocationType[]],
    { message: 'Loại địa điểm không hợp lệ.' },
  ),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
});

export const UpdateLocationSchema = CreateLocationSchema.partial();
