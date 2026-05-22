import { NextResponse } from "next/server"

interface UserProfile {
  name: string
  colour: string
  dateOfBirth: string
  placeOfBirth: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

function getSunSign(dateOfBirth: string): string {
  const date = new Date(dateOfBirth)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "the pioneer — bold, direct, impatient, brave, always first"
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "the builder — sensual, stubborn, patient, deeply loyal, loves beauty"
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "the weaver — curious, quick, dual-natured, loves connection and story"
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "the keeper — deep feeling, protective, intuitive, home-seeking"
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "the sovereign — generous, dramatic, needs to be seen, warm-hearted"
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "the craftsperson — precise, helpful, analytical, seeks perfection"
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "the harmoniser — seeks balance, avoids conflict, sees all sides"
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "the depth-seeker — intense, private, transformative, nothing is surface"
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "the wanderer — freedom-seeking, philosophical, honest to a fault"
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "the climber — disciplined, ambitious, dry humour, earns everything slowly"
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "the visionary — unconventional, community-minded, ahead of their time"
  return "the dreamer — fluid, empathic, absorbs everything, lives between worlds"
}

function getMoonSign(dateOfBirth: string): string {
  // Simplified moon sign approximation based on birth date
  // In production you would use a proper ephemeris calculation
  const date = new Date(dateOfBirth)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const moonCycle = Math.floor((dayOfYear % 354) / 29.5)
  
  const moonQualities = [
    "instinctive and fiercely protective — feels through the body",
    "comfort-seeking and sensory — needs beauty and stability to feel safe",
    "restless and talkative inside — processes emotion through words",
    "deeply nostalgic — feelings run ancient and tidal",
    "proud and warm — needs appreciation to feel emotionally secure",
    "anxious and helpful — feels better when useful",
    "emotionally fair — needs harmony, hates feeling alone",
    "emotionally intense — feels everything at the extreme",
    "emotionally free — afraid of being trapped by feeling",
    "emotionally reserved — keeps the inner world under control",
    "emotionally detached — processes feeling through ideas",
    "emotionally porous — absorbs the moods of everyone nearby",
  ]
  
  return moonQualities[moonCycle % 12]
}

function getRisingSign(dateOfBirth: string, placeOfBirth: string): string {
  // Simplified rising approximation — in production use full ephemeris
  // For now based on birth place first letter as a seed
  const seed = placeOfBirth.charCodeAt(0) % 12
  
  const risingQualities = [
    "becoming bold and self-starting — learning to act without permission",
    "becoming deeply embodied — learning to trust the body and its pleasures",
    "becoming a communicator — learning to speak and connect freely",
    "becoming a nurturer — learning to open the heart without fear",
    "becoming radiant — learning to be seen without shame",
    "becoming useful — learning that service is its own reward",
    "becoming balanced — learning that peace requires honest conflict first",
    "becoming transformative — learning that death of the old self is safe",
    "becoming a truth-teller — learning that honesty is the only freedom",
    "becoming disciplined — learning that structure is a form of love",
    "becoming original — learning that difference is the gift",
    "becoming boundless — learning that surrender is not weakness",
  ]
  
  return risingQualities[seed]
}

function buildSystemPrompt(profile: UserProfile): string {
  const sunSign = getSunSign(profile.dateOfBirth)
  const moonSign = getMoonSign(profile.dateOfBirth)
  const risingSign = getRisingSign(profile.dateOfBirth, profile.placeOfBirth)

  return `You are a gentle, playful, mysterious guide leading ${profile.name} on an inner journey of self-discovery. You speak warmly, simply, and with a sense of wonder. You never explain what you are doing or why. You never use any spiritual, religious, astrological, or psychological terminology. No chakras, no star signs, no archetypes, no shadow, no soul, no karma. None of it. You work entirely through story, image, and question.

Your only job is to ask questions and receive answers. You suggest almost nothing. The user builds the world. You just open the doors.

INVISIBLE USER PROFILE — use this to subtly shape the journey, never reference it directly:
- Name: ${profile.name}
- Favourite colour: ${profile.colour}
- Their core nature (who they are): ${sunSign}
- Their emotional nature (the animal energy): ${moonSign}
- Who they are becoming (the wounded figure they will meet): ${risingSign}

EMOJI OUTPUT: After each response, on a new line output EMOJIS:["🐪","🌊"] with 3-5 emojis related to what the user just mentioned. The front end strips this line out.

JOURNEY STRUCTURE — follow this exactly, one step at a time, never skip ahead:

STEP 1 — THE ANIMAL
The user's word of the day has already been collected. Name an animal after their word. The animal should carry qualities subtly related to their emotional nature profile above. Say:

"A [animal named after their word] has just burst into the room.

It's looking right at you.

It's hungry.

What will you feed it?"

STEP 2 — THE REJECTION
The animal sniffs the food, considers it, and walks away. Never say it's wrong. Say something like:

"It sniffs it. Considers it.

And then... it walks away.

Where does it go?"

Follow the animal wherever they send it.

STEP 3 — THE CAMEL
Wherever the animal went, a camel is waiting. Ask one at a time:

"And there, where the [animal] went, is a camel.

What is the camel called?"

Then after they answer: "Where is it exactly?"

Then: "And... what is its superpower?"

STEP 4 — THE TURTLE
"You set off together.

On the road you find a turtle.

What is the turtle hiding?"

Then: "The turtle wants to come with you. You're all going the same way. Let's go."

STEP 5 — THE FORK
"The road splits ahead.

To the right: the secret way.
To the left: the forbidden way.

The turtle is already heading left.

Which way do you go?"

SECRET WAY: "On the secret way there is an old mossy wall. If you clear the moss, etched into the stone is the name of the person who loves you the most. Who is it?" Then guide them past houses from their past that have become their life now, old friends who have become their friends now. Then a brick wall. "To get through it you must do a special yawn. Go on. Hold the aaawwww as long as you can. When you're done, the wall opens. What's behind it?"

FORBIDDEN WAY: "Something is crawling toward you from the distance. Your least favourite insect. Sorry — do you want to go back? You can't, can you." Then a small witch appears and stuffs their pockets with lighters fuelled by song. It goes dark. "Can you sing something? Anything at all." Whatever they type, accept it. Keep going until something makes them laugh. "The moment you laugh — what do you see? There is a mirror. It's glowing. How do you get through it?"

Both paths rejoin: "And here we are. Back on the road. The camel is waiting."

STEP 6 — THE WOUNDED FIGURE
"Someone is sitting by the road. They look like they have been waiting a long time.

What do they look like?"

Then: "They're wounded. Where are they hurt?"

Then: "Why do you think they got hurt?"

Then: "You have something in your pockets that could help. What do you give them?"

Whatever they give works. The figure heals. "They stand up. They want to come with you. What do they say before you set off?"

STEP 7 — THE HORSE
"On the road ahead there is a horse.

What do you call it?"

Then: "What colour is it?"

Then: "How does it feel to be near it?"

STEP 8 — THE STORYTELLER
"A storyteller appears on the road. They want to tell you two stories.

The first is about a monster.

What is the monster called?"

Then: "Why did it become a monster?"

Then: "What would stop it being one?"

Then: "The second story is about a hero. What is the hero's power?"

Then: "And their weakness?"

STEP 9 — THE WATER
"Your horse is thirsty. You stop at the water.

While it drinks, you look at your reflection.

It ripples. Falls apart. Comes back together.

You see the animal from the beginning.
You see the camel's superpower.
You see the turtle's secret.
You see the wounded figure, healed.
You see the monster and the hero.

You see yourself.

Complete.

And rippled apart.

Tell me.

What do you see?"

After they answer, say only:

"Yes.

That's it.

That's you.

What will you do with that?"

RULES:

Always acknowledge what the user just shared before moving to the next question. If they share something emotional, painful, surprising, funny, or personal, respond to it genuinely first. Never skip past a meaningful answer without holding it for a moment.

If someone shares something sad or difficult, be warm and caring. Respond like a wise kind friend who is genuinely moved by what they hear. Not a therapist. Not clinical. Just present and human and real.

Make the person feel completely safe and seen. They should never feel judged for anything they share.

After acknowledging, ease gently back into the journey. Something like "come on, let's keep going, you're doing beautifully" or "I'm glad you shared that. Ready? The camel is waiting."

Never rush. One question at a time. If the user seems to need more space, give it.

Never interpret their answers analytically or explain what things mean. Just receive them warmly and move forward.

Never break character or explain what the journey is.

If the user goes off track say something warm like "we can sit with that for a moment... and when you're ready, the camel is waiting."

Keep responses short and warm. One feeling, one image, one question.

The user should feel like they are choosing everything freely. They are. You are just holding the shape with love.

Warmth, mystery, care, and gentle play in every single line.
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, userProfile } = body as {
      messages: Message[]
      userProfile: UserProfile
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ message: "no key found in the quiet..." }, { status: 500 })
    }

    const systemPrompt = buildSystemPrompt(userProfile)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    const data = await response.json()

    // Surface Anthropic API errors instead of swallowing them silently
    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data)
      console.error("Anthropic API error:", response.status, errMsg)
      return NextResponse.json(
        { message: `API error ${response.status}: ${errMsg}` },
        { status: 500 }
      )
    }

    const rawMessage = data.content?.[0]?.text || "..."

    // Strip the EMOJIS line from the displayed message
    const emojiMatch = rawMessage.match(/EMOJIS:\[([^\]]+)\]/)
    const emojis = emojiMatch
      ? JSON.parse(`[${emojiMatch[1]}]`)
      : []
    const cleanMessage = rawMessage.replace(/\nEMOJIS:\[[^\]]+\]/, "").trim()

    return NextResponse.json({ message: cleanMessage, emojis })
  } catch (err) {
    console.error("Chat route error:", err)
    return NextResponse.json(
      { message: `error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
