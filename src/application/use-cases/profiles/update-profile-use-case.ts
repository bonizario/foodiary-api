import { Profile } from "@/application/entities/profile";
import { ResourceNotFoundError } from "@/application/errors/application/resource-not-found-error";
import { Injectable } from "@/core/decorators/injectable";
import { ProfileRepository } from "@/infrastructure/database/dynamo/repositories/profile-repository";

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  public async execute(dto: UpdateProfileUseCase.Input): Promise<UpdateProfileUseCase.Output> {
    const profile = await this.profileRepository.findByAccountId(dto.accountId);

    if (!profile) {
      throw new ResourceNotFoundError("Profile not found");
    }

    profile.name = dto.name;
    profile.birthdate = dto.birthdate;
    profile.biologicalSex = dto.biologicalSex;
    profile.height = dto.height;
    profile.weight = dto.weight;

    await this.profileRepository.save(profile);
  }
}

export namespace UpdateProfileUseCase {
  export type Input = {
    accountId: string;
    name: string;
    birthdate: Date;
    biologicalSex: Profile.BiologicalSex;
    height: number;
    weight: number;
  };

  export type Output = void;
}
