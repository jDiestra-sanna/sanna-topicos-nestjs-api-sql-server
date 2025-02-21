import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { ClientsService } from "src/modules/clients/clients.service";

@Injectable()
@ValidatorConstraint({name: 'ClientExists', async: true})
export class ClientExistsRule implements ValidatorConstraintInterface {
  constructor(private readonly clientsService: ClientsService) {}

  async validate(id: number): Promise<boolean> {
    const exists = await this.clientsService.clientExists(id)
    return exists
  }

  defaultMessage(args: ValidationArguments) {
    return 'No existe el Cliente'
  }
}