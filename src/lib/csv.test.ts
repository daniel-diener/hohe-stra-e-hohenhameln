import { describe, expect, it } from "vitest";
import { alsCsv } from "./csv";
import { suchbegriff } from "./leads";

describe("alsCsv", () => {
  it("setzt BOM, Semikolon und Anführungszeichen", () => {
    expect(alsCsv(["a", "b"], [["x;y", 'sagt "hallo"'], [null, 3]])).toBe(
      '﻿a;b\r\n"x;y";"sagt ""hallo"""\r\n;3\r\n',
    );
  });

  it("entschärft Formeln", () => {
    expect(alsCsv(["a"], [["=HYPERLINK(1)"]])).toBe("﻿a\r\n'=HYPERLINK(1)\r\n");
  });
});

describe("suchbegriff", () => {
  it("entfernt Zeichen, die einen PostgREST-Filter gliedern", () => {
    expect(suchbegriff("a,status.eq.neu)")).toBe("a status eq neu");
    expect(suchbegriff(" x ")).toBe(null);
  });
});
