# Navigation Quest Time Routine (NQTR)

![cover](https://github.com/user-attachments/assets/bf362f78-ea75-4b91-8dcb-4f8e7dbf9e9f)

<p align="center">
  <a href="https://www.npmjs.com/package/@drincs/nqtr" rel="noopener noreferrer nofollow"><img src="https://img.shields.io/npm/v/@drincs/nqtr?label=version" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@drincs/nqtr" rel="noopener noreferrer nofollow"><img src="https://img.shields.io/npm/dm/@drincs/nqtr" alt="npm downloads per month"></a>
  <a target="_blank" href="https://www.jsdelivr.com/package/npm/@drincs/nqtr" rel="noopener noreferrer nofollow"><img alt="jsDelivr hits (npm)" src="https://img.shields.io/jsdelivr/npm/hm/@drincs/nqtr?logo=jsdeliver"></a>
  <a href="https://www.npmjs.com/package/@drincs/nqtr" rel="noopener noreferrer nofollow"><img alt="NPM License" src="https://img.shields.io/npm/l/@drincs/nqtr"></a>
  <a target="_blank" href="https://discord.gg/E95FZWakzp" rel="noopener noreferrer nofollow"><img alt="Discord" src="https://img.shields.io/discord/1263071210011496501?color=7289da&label=discord"></a>
</p>

**What is NQTR?** NQTR (Navigation Quest Time Routine) is an extension for Pixi’VN that adds advanced systems for navigation, quests, time management, and game state handling. It is fully customizable and extensible, enabling developers to implement complex game mechanics with ease.

## Installation

If you are starting a new Pixi’VN project, it is recommended to use one of the [templates](https://pixi-vn.com/start#project-initialization) that already include NQTR.

To install the NQTR package in an existing JavaScript project, use one of the following commands:

```npm
npm install @drincs/nqtr
```

## Development

Use Node.js 20.19.0 or newer to run the tests and use Vite 8. The release build uses `tsup@9` and requires Node.js 22.18.0 or newer. Package metadata does not enforce these versions.

```sh
npm ci
npm test
npm run build
```

## Features

NQTR provides the following features (the order is important):

1. [Navigation and map](https://pixi-vn.com/nqtr/navigation)
2. [Time system](https://pixi-vn.com/nqtr/time)
3. [Activity](https://pixi-vn.com/nqtr/activity)
4. [Routine](https://pixi-vn.com/nqtr/routine)
5. [Quest system](https://pixi-vn.com/nqtr/quest)

## Agent Skills

NQTR ships a set of [Agent Skills](https://www.skills.sh/) that teach AI coding assistants how to correctly use each part of the library. When a project uses Pixi’VN with ink, the skills prefer ink (hashtag commands such as `# enter room`, `# wait`, `# start quest`) over TypeScript labels.

> In LM Studio Bionic, ask the agent to install skills from `https://github.com/DRincs-Productions/nqtr`, or add the skill files in **Settings → Skills**. To reuse skills installed for Codex or Claude Code, enable **Settings → Skills → Use skills found in other apps**.

**Codex**:

```npm
npx skills@latest add DRincs-Productions/nqtr@latest --skill '*' --agent codex -g -y
```

**Claude Code**:

```npm
npx skills@latest add DRincs-Productions/nqtr@latest --skill '*' --agent claude-code -g -y
```

**Other agents**:

```npm
npx skills@latest add DRincs-Productions/nqtr@latest --all -y
```

Available skills:

- `getting-started` (skill `nqtr`) — the index of the skill set: skill map, installation, registries, the Vite plugin, `OnRunProps`, custom classes
- `ink` — every NQTR hashtag command and quest variable for `.ink` files
- `navigation` — rooms, locations, maps and `navigator`
- `time` — `timeTracker`, time slots, `wait`
- `activity` — player actions linked to rooms
- `routine` — character commitments (schedules)
- `quest` — quests, stages and state queries

Install them together with the [Pixi’VN](https://github.com/DRincs-Productions/pixi-vn) and [Pixi’VN ink](https://github.com/DRincs-Productions/pixi-vn-ink) skills.
