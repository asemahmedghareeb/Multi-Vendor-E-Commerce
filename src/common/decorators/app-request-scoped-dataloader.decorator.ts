import { Injectable, Scope } from '@nestjs/common';

export function AppRequestScopedDataloader(): ClassDecorator {
  return (target: any) => {
    Injectable({ scope: Scope.REQUEST })(target);
  };
}
