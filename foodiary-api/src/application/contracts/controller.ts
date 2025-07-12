import { getSchema } from "@/core/decorators/schema";

export abstract class Controller<TRequestType extends Controller.RequestType, TBody = undefined> {
  protected abstract handle(
    request: Controller.Request<TRequestType>,
  ): Promise<Controller.Response<TBody>>;

  public execute(request: Controller.Request<TRequestType>): Promise<Controller.Response<TBody>> {
    const body = this.validateBody(request.body);

    return this.handle({ ...request, body });
  }

  private validateBody(body: Controller.Request<TRequestType>["body"]) {
    const schema = getSchema(this);

    if (!schema) {
      return body;
    }

    return schema.parse(body);
  }
}

export namespace Controller {
  type BaseRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
  };

  type PublicRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: null;
  };

  type AuthenticatedRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    accountId: string;
  };

  export type RequestType = "public" | "authenticated";

  export type Request<
    TRequestType extends RequestType,
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = TRequestType extends "public"
    ? PublicRequest<TBody, TParams, TQueryParams>
    : AuthenticatedRequest<TBody, TParams, TQueryParams>;

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
  };
}
