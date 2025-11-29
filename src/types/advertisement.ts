export interface Advertisement {
  id: string
  title: string
  description?: string
  price?: number
  brand?: string
  model?: string
  year?: number
  fuelType?: string
  transmission?: string
  bodyType?: string
  color?: string
  mileage?: number
  engineCapacity?: number
  power?: number
  drivetrain?: string
  doors?: number
  seats?: number
  vin?: string
  firstRegistrationDate?: string
  trimLevel?: string
  status?: 'published' | 'draft' | 'sold'
  images?: Array<{ url: string, alt?: string }>
  features?: string[]
  equipment?: string[]
  contact?: {
    name?: string
    email?: string
    phone?: string
    location?: string
  }
  createdAt?: string
  updatedAt?: string
}