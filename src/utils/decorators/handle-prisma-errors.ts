// handle-prisma.decorator.ts
/**
 * Decorator: @HandlePrismaError
 * Author: Thrashy
 * Last updated: 2024-04-29
 *
 * Description:
 * This method decorator automatically wraps the decorated async method in a try-catch block
 * and delegates any thrown error to the centralized `handlePrismaError` utility. It is designed
 * to keep service methods clean by removing repetitive error handling logic specifically
 * related to known and expected Prisma errors.
 *
 * Usage:
 * @HandlePrismaError()
 * async someServiceMethod() {
 *   // business logic
 * }
 */

import { handlePrismaError } from '@/common/error/prisma-error';

export function HandlePrismaError() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        handlePrismaError(error);
      }
    };

    return descriptor;
  };
}
