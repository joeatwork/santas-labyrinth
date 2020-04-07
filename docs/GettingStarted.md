# Getting Started with Adventurebot 2000

    TODO Diagram to come

The Adventurebot 2000 operates by interpreting text commands. To execute a
command immediately, type the command into the *command field* and press the
enter key on your keyboard. You can also execute the command in the command
field by clicking the ![play](./images/play_circle_filled_24px.svg) icon next to
the command field.

## Moving the Robot

To move the robot, you'll need three commands: `forward`, `left`, and `right`:

* `forward` moves the robot forward one tile
* `left` turns the robot 90 degrees counterclockwise
* `right` turns the robot 90 degrees clockwise

Try experimenting with each of these commands in the command field. Remember to
press Enter on the keyboard after typing the command.

## Robot Jobs

In addition to typing commands directly into the command field, you can write a
list of commands, give that list a name, and then use that name to tell the
robot to execute the whole list of commands at once. A named list of commands
for the robot is called a *job*.

### Creating a New Job

To define a job, click the *+ Create New Job* tab. Then put a name into the
field labeled "Create job named:", and then click the "Create Job" button below
the field. Job names must only contain letters or numbers, and can't have
spaces.

Try creating a job named "move4times". Notice that there are no spaces in the
name.

### Defining the Commands in a Job

Once you've clicked the "create job", you'll see the *Job Editor*. It's a text
text field with the name of your job at the top. You can type directly into the
editor to add commands to the job. Every command should end with a newline.

To define a job that moves the robot forward four times, you can type the
following into the editor:

    forward
    forward
    forward
    forward

As you type, you'll see an asterisk after the name of the job above the editor.
That means that the version of the job you're looking at in the editor doesn't
match the version that the robot is using. Once you've typed the commands for
the job into the editor, click the ![save](./images/save-24px.svg) save icon to send
the job to the robot. You'll see the asterisk go away, and you'll be able to
have the robot run the job by clicking the
![play icon](./images/play_circle_filled_24px.svg) play icon.

Try defining a job, saving your work, and clicking the play icon to run your job
with the robot. If you type things the robot doesn't understand, you'll get a
message with a suggestion about how to change your job so the robot can execute
it.

## Advanced Commands: Walk to the Next Wall

In addition to the commands that make the robot move, there other kinds of
commands you can give to the robot. These commands are most useful as part of a
job. A complete description of all the command for the robot can be found in the
[Command Language Reference](LanguageReference.md), but for now let's just look
at a job with some commands you've never seen before. Create a new job named
"walktowall", and then paste the following text into the job editor:

    touch wall
    if yes left
    forward
    repeat

Click the save icon and then the play icon next to the job name to save and
run the job. The robot will walk forward until it gets to a wall, and then turn
left. It will keep going like this until you press the
![stop icon](./images/stop-24px.svg) stop icon next to the job name.

### `touch wall` and `if yes`

The first line of the job is `touch wall`. It's a form of command we haven't
seen before: instead of just one word like `forward`, it's two words, but
they're both part of the same command.

`touch wall` asks a question about the robot's environment, and depending on the
answer changes the state of the robot. The robot can touch things in the tile
immediately in front of it, so `touch wall` asks "Is there a wall immediately in
front of the robot?" If the answer is yes, the robot flips a switch inside of
itself.

By itself, asking the question doesn't really do much, but it works together
with the next command, `if yes left`. This command looks familiar, but isn't
quite what we've seen already - we know that `left` means "rotate the robot 90
degrees", but the `if yes ...` part is new.

Any command can be preceeded by `if yes`. In this form, the command is only
executed by the robot if the answer to the last question the robot asked was
"yes". Here's another way of looking at the first two lines of the new job:

    touch wall (if there is a wall in front of the robot, set the answer "yes")
    if yes left (turn left only if the answer "yes" is set)
    
We say that `touch wall` "sets the yes register" and `if yes` "reads the yes
register". 

### `repeat`

We understand the beginning of the job now: "If there is a wall in front of the
robot, turn the robot to the left". And we've already seen the `forward`
command. But what about the last line of the job, `repeat`?

The `repeat` command tells the robot to start the whole job over from the
beginning. In this case, the robot goes right back to `touch wall` and does the
whole thing over again. If you never pressed the stop icon, the robot would
keep going around walls forever.

## Next Steps

With just `forward`, `left`, `right`, `touch wall`, `if yes ...`, and `repeat`,
you can get some pretty complex behavior from the robot. But there are even more
commands you can try:

* You can move the robot backwards with the `backward` command.
* You can stop a job automatically with the `finish` command.
* Jobs can run other jobs with `do ...` commands.
* There is an `if no ...` command that is the opposite of `if yes ...`.

You can learn more about these commands and others in the [Command Language
Reference](LanguageReference.md), or just experiment with them on the robot!

Happy Adventuring!
