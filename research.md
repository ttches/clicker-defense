Research the math behind some of the best clicker / incremental games:

cookie clicker
leaf blower revolution
exponential idle
revolution idle

all exit on android / steam. I know you can get their apks yourself. Would it be easier if I got the steam games on my hard drive? We should git ignore the game downloads. They're only references to learn from, we won't be modifying the game or need to be concerned about copyright

I want to understand the gameplay mechanics and the math pacing. we should make detailed guides on the details of each game to strategize our own.

I want tables of the real math to be able to reference later as well

You can look at the history of ../clickpoc to see a strategy I have used before to read an android apk to see if that will allow us to thoroughly understand the mechanics vs downloading through steam. We likely wouldn't need to be as thorough because the goal there was to eventually be human readable, but we wouldn't need that for research necessarily

you'll be working similarly to the orchestrator in ../clickpock-web-port, interfacing with me and being an expert on our current plan (the game research docs) and managing agents to save your context, but maybe less tied to the exact implementation details of the skill.

Our work will be done in a well organized idle-game-mechanic-research folder

Also have an agent gather info from discussions relating to guides like this one from this user:
https://www.reddit.com/r/incremental_games/comments/1ydowj/mechanics_of_incremental_games_6_scaling_and/

It looks like there are at least 6 of them. Find the guide posts, read the guides, read any credible comments with good ideas. Here's an example comment I like:

```
Another consideration is how closely to approximate the cost curve. For example, in cookie clicker with a 1.15 multiplier, the cost of successive buildings might be:

100, 115, 132, 152, 174, 201, 231, 266, ...

But you could also have a similar effect with this:

100, 100, 100, 100, 100, 200, 200, 200, ...

Doubling every five purchases yields a similar price curve. But there are plateaus followed by larger cliffs. Why might you do this?

First, to make the prices more comprehensible. If you stick to round numbers and roughly double between them (100, 200, 500, 1000, etc.) then it is easier for the user to see at a glance how much it costs because you don't have too much precision which acts as a distraction.

But, second, it is important to feel a sense of progress as well as a sense of increasing challenge. By keeping the cost the same for successive upgrades for a little while, the player can have the sense of getting ahead of the curve. Buying a new building feels more effective since it makes the next building more affordable. The cliff at the end increases the requirements more dramatically and marks a new obstacle to be overcome.

Scaling can also communicate the the user which choices are more appropriate. Often, you'll have two different upgrades which are multiplied together to provide an effect. The best strategy here is to generally upgrade them both at about the same rate because 5*5 is bigger than 1*10. You can use scaling as a kind of nudge to push the user in the right direction here. The cost of one could be multiplied by the relative difference between them.

One other thing to consider is discount scaling. A number of incremental games provides some kind of discount upgrade which reduces the prices of other upgrades. The key thing to remember here is that a discount multiplier can be tricky. So having things that provide flat discounts can have unintended effects.

The relative difference between a 1% discount and a 2% discount is small. But the relative difference between a 98% discount and a 99% discount is huge. The latter halves all my costs! So however you scale your discounts, make sure that they have a larger headline effect lower levels and a smaller headline effect at larger levels. And your discount must never get to 100%.

Diablo 1/2 had a discount system for elemental damage. And it avoided this problem by capping the discount at 75%. Sandcastle Builder has a single discount boost that provides a permanent 80% discount but you can't buy multiple levels of it.
```

You can look through history here to find the other guides:
https://www.reddit.com/user/Guildenstern_artist/submitted/

So that further analysis can be done in the future, I'd love for our research to capture sources for truths in addition to the summaries. Don't just abstract the real numbers away with summaries
Could even have multiple agent passes where first we decode game mechanics, then gather hard numbers, then analyze, etc. But I don't want to be too prescriptive because you know best but we're going for that direction

You should decide if we want to do one game at a time or go in phases that apply to all games before moving onto the next phase, etc.

This can be a long term epic that we chip away with, whatever strategy you think is best.

We'll want to record our progress and choices along the way as this will span many sessions perhaps

The plan can include future spikes
