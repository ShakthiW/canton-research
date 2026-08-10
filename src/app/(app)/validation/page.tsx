import { getValidations } from '@/lib/queries/validation'
import { getProducts } from '@/lib/queries/products'
import { ValidationClient } from '@/components/validation/ValidationClient'

export default async function ValidationPage() {
  const [validations, { items: products }] = await Promise.all([
    getValidations(),
    getProducts({ limit: 100 }),
  ])

  return <ValidationClient validations={validations} products={products} />
}
