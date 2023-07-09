{
  // Version 1:
  interface Document {
    buffers: Buffer[];
    accessors: { [key: string]: number }; // number is an index into buffers
  }

  interface Buffer {
    value: number | string | boolean;
  }

  {
    let doc: Document = null as any as Document; // get Document somehow

    let buffer_regular: Buffer = doc.buffers[doc.accessors["asdf"]];
    let value_regular: number | string | boolean = buffer_regular.value;

    let buffer_alpha: Buffer = doc.buffers[doc.accessors["Alpha"]];
    let value_alpha: number | string | boolean = buffer_alpha.value;

    // doesn't compile:
    // let value_named: number = buffer_named.value;
  }
}

{
  // Version 2:
  interface Document {
    buffers: Buffer[] & SpecialBuffers;
    accessors: { [key: string]: number } & SpecialAccessors;
  }

  interface Buffer {
    value: number | string | boolean;
  }

  type Brand<S extends string> = number & { __brand: S };

  type SpecialBuffers = Record<Brand<"Alpha">, BufferAlpha> &
    Record<Brand<"Beta">, BufferBeta>;

  interface SpecialAccessors {
    Alpha: Brand<"Alpha">;
    Beta: Brand<"Beta">;
  }

  interface BufferAlpha {
    value: number;
  }

  interface BufferBeta {
    value: boolean;
  }

  {
    let doc: Document = null as any as Document; // get Document somehow

    let buffer_regular: Buffer = doc.buffers[doc.accessors["asdf"]];
    let value_regular: number | string | boolean = buffer_regular.value;

    let buffer_alpha: BufferAlpha = doc.buffers[doc.accessors["Alpha"]];
    let value_alpha: number = buffer_alpha.value; // note: number

    // doesn't compile:
    // let buffer_regular: BufferAlpha = doc.buffers[doc.accessors["asdf"]]; // expected Buffer, not BufferAlpha
    // let value_beta: number = doc.buffers[doc.accessors["Beta"]].value; // expected boolean, not number
  }
}

{
  // Version 3:
  interface Document {
    buffers: Buffer[] & SpecialBuffers;
    accessors: { [key: string]: number } & SpecialAccessors;
  }

  interface Buffer {
    value: number | string | boolean;
  }

  type Brand<S extends string> = number & { __brand: S };

  type SpecialTypes = {
    Alpha: { value: number };
    Beta: { value: boolean };
  };

  type SpecialBuffers = { [K in keyof SpecialTypes as Brand<K>]: SpecialTypes[K] };

  type SpecialAccessors = { [K in keyof SpecialTypes]: Brand<K> };

  /*
  // Above is equivalent to:

  keyof SpecialTypes == "Alpha" | "Beta"

  type SpecialBuffers = {
    [key: Brand<"Alpha">]: {
        value: number;
    };
    [key: Brand<"Beta">]: {
        value: boolean;
    };
  }

  type SpecialAccessors = {
    Alpha: Brand<"Alpha">;
    Beta: Brand<"Beta">;
  }
  */

  {
    let doc: Document = null as any as Document; // get Document somehow

    let accessor_regular: number = doc.accessors["asdf"];
    let buffer_regular: Buffer = doc.buffers[accessor_regular];
    let value_regular: number | string | boolean = buffer_regular.value;

    let accessor_alpha: Brand<"Alpha"> = doc.accessors["Alpha"];
    let buffer_alpha: SpecialTypes["Alpha"] = doc.buffers[accessor_alpha];
    let value_alpha: number = buffer_alpha.value; // note: number

    let x = Array<keyof SpecialTypes>;

    // doesn't compile:
    // let buffer_regular: SpecialTypes["Alpha"] = doc.buffers[doc.accessors["asdf"]]; // expected Buffer, not BufferAlpha
    // let value_beta: number = doc.buffers[doc.accessors["Beta"]].value; // expected boolean, not number
  }
}
