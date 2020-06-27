<p align="center">
  <img src="https://raw.githubusercontent.com/aGuyNamedJonas/updraft/master/design/updraft-logo-text-color.svg" alt="Sublime's custom image"/>
</p>

> The Vision and Mission described here provide a shared direction for anyone contributing to updraft. The Values described here provide a shared set of guiding principles that help us make decisions about the direction & the focus of this project (and help us give helpful advice in pull requests).

> The values of how we interact with each other in and around this project are described in our [Code of Conduct](../CODE_OF_CONDUCT.md).

# Vision
Empower people to deliver their apps to a global audience

# Mission
Provide building blocks to effortlessly build complex cloud-infrastructure with ease - in the programming language environment developers already know.

# Values

**Empowerment** We specifically build updraft to empower people all around the world to bring the positive change to the world that they envision.

**Simplicity** Simplicity is the high art of making the complex easy. It's a continuous effort, and only when something is easy to understand and easy to use does it start to be *simple*.

**No entry barriers** We strive to make it so easy for any developer to use modern, scalable cloud-infrastructure [that a caveman can do it](https://www.youtube.com/watch?v=0trj6jCsm6E&list=PL54009BDBDE3A8C8D). We also strive to help make CDK and updraft modules available for as many developers, programming languages and infrastructure providers as maintainably possible.

# The Stories behind the values
The following stories are my personal reasons why I think the above values and *updraft* itself, is important. My hope is that they help you identify with what *updraft* is trying to accomplish. If you have any reactions, thoughts, or your own personal story that you would like to respond with, please leave them in the [comment section](https://github.com/aGuyNamedJonas/updraft/issues/52).

### Empowerment
I don't know about you, but at a certain point I started to grow tired of people reacting to my profession as a developer with the self-defeating statement of "oh I could never do that".

Really!? You don't think you could [Stackoverflow](https://insights.stackoverflow.com/survey/2020#technology-what-do-you-do-when-you-get-stuck) your way through a high-paying job with a ton of perks, like Club-Mate fridges and an environment that somehow learned to accept colleagues running around bare-foot (oh the free spirits that they are)!?

I mean maybe you actually enjoy being viewed as half-God, half-Mortal. But to me personally that's just wrong. I for one didn't study half as hard in college as any of my friends in medicine had to. And honestly, all the stuff I learned that I use in my job was self-taught anyways. Anybody can learn this. It's not black magic. And it's definitely no different than any of the other engineering disciplines where it comes down to knowing what technical systems to combine in what way under the given requirements.

So for all of the people who ever thought "they weren't good at math" because they had bad teachers, or anybody who puts me on a pedastal because I can stare at a screen all day as my job, I want to say the following: Shut up, sit down, and learn this stuff if you like - you can totally do this - stop selling yourself short. Also: If Karlie Kloss (huge fan!) [can teach teenagers to code](https://www.kodewithklossy.com/), you can learn this, too.

Aside from that rant of the overhype around the intelligence level of developers, I was always drawn to learning how to setup my own infrastructure because it made me feel empowered. I'm traditionally a frontend guy because I enjoy building tools that inspire creativity. But it never satisfied me to "just do frontend". I also wanted to know how to build the backends, and how to run the damn thing as well. I wanted to at least know how to do it all - it makes me feel like I can do anything.

And *that* exact feeling is what I want to bring to people using updraft. Anyone with an internet connection, a computer and the willigness to learn this stuff, should be empowered to not only learn how to build apps, but also how to deliver them to the world. I hope that *updraft* can create the same sense of empowerement for people I've felt when I learned this stuff for the first time.

👉🏻 If you also want to become a Karlie Kloss fan, check out her [YouTube channel](https://www.youtube.com/watch?v=koAgIRz59ZU) or check out her amazing [Kode with Klossy](https://www.kodewithklossy.com/) project

In ❤️ with empowering people? [Help us build updraft](https://github.com/aGuyNamedJonas/updraft/blob/master/CONTRIBUTING.md)

### Simplicity
I believe that only simple tools can solve complex problems. My favorite example for this are [binary trees](https://en.wikipedia.org/wiki/Binary_tree): It's simple to explain - you have nodes which represent values, right of that node are all the nodes that have a higher value, left of the node are all the nodes of lower value.

Binary trees are used for finding values in a large number of data-points while only having to check very few nodes to find it. For example: If every person on the planet was sorted in a perfectly balanced binary tree, you would only need 33 layers to organize the world-population of [roughly 8 billion people](https://en.wikipedia.org/wiki/World_population). What that means is that you only have to ask 33 people for their first name and last name to find *anyone* by their name alone.

Let me stress this: Ask 33 people to find *anyone* out of 8 billion people, by simply arranging people in a way that anyone before them (sorted alphabetically) is left of them, anyone after them is right of them.  
This blows my mind - and it's such a simple structure that I feel like I could explain this to anyone.

👉🏻 Read more: [Binary Trees, as explained by the Stanford University](http://cslibrary.stanford.edu/110/BinaryTrees.pdf)

The other reason why simplicity is such an important value to me personally is that it makes me feel good. When something is simple to use and I can easily bring my ideas to life with a tool that I'm using. That makes me feel good because I can bring what's inside my head to the outside world. Simple tools allow me to express my unique ideas for how this world should be different and being able to express those to the world gives me an incredibly deep feeling of self-worth.

The opposite of that is hard to use tools which make me question whether the creative expression I'm trying to use a tool for is even for me. Noticed that? I'm questioning my *creative expression* because a bad tool has made it so hard for me that I wasn't able to get past the learning curve.

Simple tools on the other hand, make a the creative expression they enable accessible to more people than ever before.

In ❤️ with elegantly-simple things? [Help us build updraft](https://github.com/aGuyNamedJonas/updraft/blob/master/CONTRIBUTING.md)

### No entry barriers
Entry barriers suck. In it's most tame form it's a steep learning curve, in it's most harmful forms it keeps people out - and can even be used to discriminate against people by keeping them out on purpose.

I had this funny epiphany the other day: I was really frustrated by trying to setup an API Gateway with my IoC (Infrastructure as Code) setup and despite multiple different approaches it couldn't get it to work in over a week. I was really fuming when my fiancee Anni and me did our workout that day, outside of our apartment building in a little park, when I realized how crazy it was to work with modern cloud infrastructure. Being able to see my room from where we worked out, I realized what it meant to get to work with globally scaling infrastructure: Typing a few commands into my laptop, these commands would travel down into an underground cable, went through a physical line that stretches across the bottom of the ocean and finally sets a configuration in Virgina, USA to setup some certificate.

At that moment all of my frustration vanished and gave way to a sense of awe that I often forget in my day-to-day work as a developer. We get to work with amazing technology, that spans the whole globe.

People used to have to buy expensive hardware to get to make their apps available to the internet like that. Plus in my mind, this tech is largely democratized. With the free tiers available from every large public cloud provider, anyone with an internet connection can use this stuff.

To me that's one of the best examples of how an entry barrier got completely erradicated. All you need is a computer, an internet connection and the willingness to learn this stuff (let me know in the [comment section](https://github.com/aGuyNamedJonas/updraft/issues/52) where I might be wrong about that assessment).

It gives me great joy to think that hopefully somebody in the future will find updraft, and realize that cloud infrastructure isn't that hard to use after all. Hopefully they get to have the same mind-blowing realization about the scale of the technology they get to work with.

👉🏻 For a different and really cool example of tech lowering the entry barrier, checkout [The Untold Story of Ableton Live—the Program That Transformed Electronic Music Performance Forever](https://www.vice.com/en_us/article/78je3z/ableton-live-history-interview-founders-berhard-behles-robert-henke)

In ❤️ with cloud-computing? [Help us build updraft](https://github.com/aGuyNamedJonas/updraft/blob/master/CONTRIBUTING.md)

------
Sharing the personal stories that inform the values behind this project is inspired by the amazing [Tribal Leadership (Dave Logan et. al.)](https://www.triballeadership.net/)
