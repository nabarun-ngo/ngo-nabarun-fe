declare module '@truto/replace-placeholders' {
  function replacePlaceholders<T>(
    obj: T extends string | string[] | Record<string, unknown> ? T : never,
    context: Record<string, unknown>
  ): T
  export default replacePlaceholders
}
