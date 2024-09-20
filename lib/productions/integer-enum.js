import { list, unescape, autoParenter } from "./helpers.js";
import { WrappedToken } from "./token.js";
import { Base } from "./base.js";

export class IntegerEnumValue extends WrappedToken {
  /**
   * @param {import("../tokeniser.js").Tokeniser} tokeniser
   */
  static parse(tokeniser) {
    const name = tokeniser.consumeKind("identifier");
    if (name) {
      /** @type {Base["tokens"]} */
      const tokens = { name };
      tokens.assign = tokeniser.consume("=");
      if (tokens.assign) {
        tokens.value = tokeniser.consumeKind("integer") || tokeniser.error("Enum members must have integer values");
      }
      return new IntegerEnumValue({ source: tokeniser.source, tokens: tokens });
    }
  }

  get type() {
    return "integer-enum-value";
  }
  get value() {
    return super.value.slice(1, -1);
  }

  /** @param {import("../writer.js").Writer} w */
  write(w) {
    return w.ts.wrap([
      w.name_token(this.tokens.name),
      w.token(this.tokens.assign),
      w.token(this.tokens.value),
      w.token(this.tokens.separator),
    ]);
  }
}

export class IntegerEnum extends Base {
  /**
   * @param {import("../tokeniser.js").Tokeniser} tokeniser
   * @param {Base["tokens"]} tokens
   */
  static parse(tokeniser, tokens) {
    const ret = autoParenter(new IntegerEnum({ source: tokeniser.source, tokens }));
    tokeniser.current = ret.this;
    tokens.open = tokeniser.consume("{") || tokeniser.error("Bodyless enum");
    ret.values = list(tokeniser, {
      parser: IntegerEnumValue.parse,
      allowDangler: true,
      listName: "integer enumeration",
    });
    tokens.close =
      tokeniser.consume("}") || tokeniser.error("Unexpected value in enum");
    if (!ret.values.length) {
      tokeniser.error("No value in enum");
    }
    tokens.termination =
      tokeniser.consume(";") || tokeniser.error("No semicolon after enum");
    return ret.this;
  }

  get type() {
    return "integer-enum";
  }
  get name() {
    return unescape(this.tokens.name.value);
  }

  /** @param {import("../writer.js").Writer} w */
  write(w) {
    return w.ts.definition(
      w.ts.wrap([
        this.extAttrs.write(w),
        w.token(this.tokens.base),
        w.name_token(this.tokens.name, { data: this }),
        w.token(this.tokens.colon),
        w.name_token(this.tokens.inheritance),
        w.token(this.tokens.open),
        w.ts.wrap(this.values.map((v) => v.write(w))),
        w.token(this.tokens.close),
        w.token(this.tokens.termination),
      ]),
      { data: this },
    );
  }
}
