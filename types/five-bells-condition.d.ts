declare module 'five-bells-condition' {
    export class PreimageSha256 {
      setPreimage(preimage: Buffer): void;
      getConditionBinary(): Buffer;
      serializeBinary: () => Buffer;
      serializeUri(): string;
      validateFulfillment(fulfillment: Buffer, message: Buffer): boolean;
    }
  
    export class PrefixSha256 {
      setSubcondition(condition: PreimageSha256): void;
      setPrefix(prefix: Buffer): void;
      getConditionBinary(): Buffer;
      serializeUri(): string;
      serializeBinary: () => Buffer;
      validateFulfillment(fulfillment: Buffer, message: Buffer): boolean;
    }
  
    export class ThresholdSha256 {
      addSubcondition(condition: PreimageSha256): void;
      setThreshold(threshold: number): void;
      serializeUri(): string;
      validateFulfillment(fulfillment: Buffer, message: Buffer): boolean;
    }
  }