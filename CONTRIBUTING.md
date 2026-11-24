# Contributing

Thank you for your interest in this project.

**Issues are the best place to start.** We monitor bug reports and feature suggestions and will respond to
them. Raising an issue first also lets us agree on an approach before you spend time on a change.

**We are not actively seeking pull requests, but we do read them.** Anything you open will be considered on
its merits. We cannot promise a review timeline, or that a change will be merged. That may change as the
project matures.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Reporting Bugs

If you find a bug, please open an issue and include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (OS, Node.js version, browser, etc.)
- Any relevant logs or screenshots

## Suggesting Features

Feature requests are welcome. Please open an issue and describe:

- The problem your feature would solve
- Your proposed solution
- Any alternatives you've considered

## RFCs and ADRs

RFCs and ADRs document significant proposed changes and the decisions made about them:

- A **Request for Comments (RFC)** is a proposal for a significant change, shared for discussion and feedback before work begins.
- An **Architecture Decision Record (ADR)** is a concise, durable record of a decision and its rationale, based on the outcome of the RFC discussion.

### RFC process

Create an RFC as a GitHub issue with a title beginning with `RFC:`. Use the [RFC issue template](.github/ISSUE_TEMPLATE/rfc.md), keep the discussion in the issue, and apply labels that describe the topic, such as `api` or `user-interface`.

An RFC is recommended for changes that:

- Are likely to take a sprint or more of work
- Add a technology, service, or dependency that others will need to run
- Change the public API, database schema, configuration, or flagd output
- Significantly change the user experience
- Are difficult to reverse

Bug fixes, refactors, small UI changes, and error messages do not need an RFC; an issue and a pull request are enough.

Once the RFC is approved by at least 3 maintainers via discussion in the GitHub issue thread and its discussion has concluded, record the decision in an ADR. The ADR should be created after the RFC is approved.

### ADR process

Add the ADR as a Markdown file under `docs/` in a pull request. Use the [OpenFeature flagd ADR template](https://github.com/open-feature/flagd/blob/main/docs/architecture-decisions/.template.md) and name the file with a sequential number and short summary, for example `0001-short-summary.md`.

Ideally, the ADR is merged before implementation issues are created and work begins. This is a best practice, not a requirement.

## Maintainers

See [MAINTAINERS.md](MAINTAINERS.md).

## License

Before contributing to this CVS Health sponsored project, you will need to sign the associated [Contributor License Agreement (CLA)](https://forms.cloud.microsoft/r/UXcktjWXtW)

By contributing to this project, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).
