# Block Parsons

> A nested block-based approach to Parsons Problems that emphasize functional problem solving.

### Contributors

This project was undertaken by the following Grinnell College students, listed in alphabetical order:

- Salyan Karki ([SalyanKarki](https://github.com/SalyanKarki))
- Julian Kim ([eoyoa](https://github.com/eoyoa))
- Elene Sturua ([elenesturua](https://github.com/elenesturua))

### Acknowledgements

- Thank you to Prof. Sam Rebelsky for advising the Summer 2025 MAP: Teaching Functional Thinking, for which this project was made for.
- Thank you to the other members in our lab:
  - Jacob Bell
  - Anna Deschamps
  - Eva Kapoor
  - Nicole Moreno González
  - William Pitchford
  - Charlotte Wade

## Install

You must have [node](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation) (or a similar package manager i.e. npm) installed.

Install the project's dependencies by running this in the root of the repository:

```shell
pnpm install
```

## Usage

For now, there is only a frontend component.

### To serve the frontend locally for development:

```shell
pnpm run dev
```

### To embed the frontend into another website/web-based platform (i.e. [Runestone](https://github.com/RunestoneInteractive/rs)):

1. Build the script with `pnpm run build`.
2. Ensure the destination website has a `div` HTML element with `id="root"`.
   - Currently, there is no way to change the `id` of the root `div`.
   - This clearly poses an issue with embedding this into other React-based frontends.
   - Future work is planned to allow the root `div`'s `id` to be variable.
3. Embed the built script into your website with the `script` HTML tag.
   - Runestone allows embedding with `interactive`s: see [kimjulian-gc/Runestone-with-React](https://github.com/kimjulian-gc/Runestone-with-React) for a minimal example.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## Future work

Here is a list of things to do if we had another five weeks (in order of subjective importance):

### • Implement error interpretation / extend Scamper interop capabilities.
- Our vision for error interpretation was to generate human-readable errors based on actual Scamper errors.
- This was inspired by [Rust's approach to helpful compiler errors](https://kobzol.github.io/rust/rustc/2025/05/16/evolution-of-rustc-errors.html).
- Prior research is advised before doing error interpretation, in case someone has thought of this before.
### • Implement solution checking.
- There are two main approaches:
  - directly compare against the generated solution, or
  - compare expected and actual Scamper output.
- If we are doing Scamper interop anyway, it might be more elegant to just do the latter approach.
- **UPDATE:** The former approach is now implemented. This will still remain until the latter approach is implemented.
### • Think about how to export/store student analytics.
- It would be nice if student analytics could be exported to Runestone.
- There should still be a general fallback option when instructors don't tie their Scheme-based course to Runestone.
  - Consider databases with good frontends and APIs.
### • Target the problem definition specification of the [SPLICE Working Group: Parsons Problems Interoperabilty Standards](https://cssplice.org/parsons/index.html).
### • Allow the `id` of the React root `div` to be variable.