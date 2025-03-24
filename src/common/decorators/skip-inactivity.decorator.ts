import { SetMetadata } from "@nestjs/common";

export const SKIP_INACTIVITY_KEY = 'skipInactivity';
export const SkipInactivity = () => SetMetadata(SKIP_INACTIVITY_KEY, true);