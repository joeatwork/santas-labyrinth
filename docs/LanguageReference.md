# The Robot Virtual Machine

The robot executes commands. The robot can store lists of commands, called
*jobs*, in its memory, and execute jobs as a single command. Jobs can execute
other jobs.

## Robot State

### orientation

The robot is oriented to the north, east, south, or west. Orientation changes
with the commands

    left
    right

### yes and no registers

Some commands ask questions about the robot's environment. Questions have a yes
or no answer - if the answer is yes, the yes register is *set* until another
question is asked. If the answer is no, the yes register is *cleared* until the
next question. The no register is the opposite of the yes register - whenever
the yest register is set, the no register is cleared, and whenever the yes
register is cleared, the no register is set.

The yes and no registers can be used along with conditional commands to change
the robot's behavior.

## Instruction Set

### Commands

When the robot executes a command instruction, it will act, either moving in the
physical world, or just changing its internal state. Some commands take
*arguments*. You can think of those commands as verbs, and the arguments as a
noun associated with them.

Only some arguments are relevant to any particular command - for example, the
robot can `touch wall`, but it can't `touch yes`. The sorts of arguments that
fit together are called a *type*. The argument types that work with robot
instructions are:

- **props**: `wall`, `mark`, `monster`, `treasure` are all props that exist in
  the world, that the robot can sense.
- **registers**: `yes` and `no`, corresponding to the yes and no registers.
- **jobs names**: You can define job names for the robot, and then execute those jobs with the `do` command.

<!--
  Commands and/or jobs will also likely be a type
  at some point
-->

#### the motions: forward, backward, left, and right

Motion commands attempt to change the physical position or orientation of the
robot.

`forward` moves the robot forward one tile in the direction of the robot's
current orientation. If the robot hits a wall or an object it might not move.

`backward` moves the robot one tile in the opposite direction of the
orientation. The robot's orientation does not change after the motion.

`left` changes the orientation of the robot, rotating it counterclockwise
one quarter turn.

`right` changes the orientation of the robot, rotating it clockwise one
quarter turn.

Calling either `right` or `left` four times in a row turns the robot completely
around and back to the same direction.

#### touch

`touch` asks a question about the contents of the tile in front of robot. It
takes a prop as an argument, the thing that may or may not be in front of the
robot. For example `touch monster` sets the yes register if there is a monster
in the tile in front of the robot, otherwise it unsets the yes register.

`touch monster` sets the yes register if there is a monster standing in front of
the robot.

`touch mark` sets the yes register if the robot has marked the tile in front of
the robot. Marks can be placed and unplaced with the `mark` command.

`touch treasure` sets the yes register if there is treasure sitting in the tile
in front of the robot.

`touch wall` sets the yes register if the robot is standing in front of a wall.

#### look

`look` works just like `touch`, but answers questions about the first object in
the line of sight of the robot. `look monster`, `look mark`, `look treasure`,
and `look wall` all work.

#### eat

`eat` attempts to eat whatever is in the tile in front of the robot. It takes no
arguments.

#### punch

`punch` attempts to punch whatever is in the tile in front of the robot.
Punching hurts monsters, it may damage treasure, and other things can react to
punching, too.

#### mark

`mark` leaves a mark on the floor where the robot is standing. Later, the robot
can look for the mark with `touch mark`. Marks can be removed with `unmark`

#### unmark

`unmark` removes any mark on the floor where the robot is standing. If there is
no mark on the floor, `unmark` does nothing.

#### do

`do` commands run jobs. When you create a job, you'll give it a name. Later, you can use that name as an argument to `do` to run that job. For example, suppose you've created a job named "search". Then you can execute job with the command `do search`.

### Conditional Commands

Any command can be prefixed with `if yes`. If a command is prefixed with `if
yes`, it is only run if the [yes register](#yes-register) is set.

For example, `forward` moves the robot forward one title. `if yes forward` only
moves the robot forward if the yes register is set. using `if yes` robots can
react to their circumstances. For example.

    touch wall
    if yes left

tells the robot to turn, but only if its facing a wall. `if no` works just the
same, so the following command

    touch monster
    if no forward

tells the robot to move forward only if there is no monster in the space ahead.

### Jobs

A job is a list of commands that can be run by the robot. Jobs have names, and
can be run just like any other commands.

For now, you can create a job by preceeding the list of commands using the
special `create job` construct.

    create job name
        ...put your commands here.
    end job name

#### finish

The `finish` command ends the job without running the rest of the commands
in the job.

#### repeat

The `repeat` command restarts the current job from the beginning.

## Sample Robot Programs

Here's a program that looks for monsters to fight and treasure to plunder.
   
    create job aggro
        touch monster
        if yes punch
        if yes repeat
    
        touch treasure
        if yes eat
        if yes repeat
        
        touch wall
        if yes left
        if yes repeat
        
        move forward
       
        move left
        look monster
        if yes repeat
        
        look treasure
        if yes repeat
        
        move right
        move right
        look monster
        if yes repeat
        
        look treasure
        if yes repeat
        
        move left
       
        repeat
    end job aggro

And here's a pair of programs that work together to keep our robot out of
danger! Notice that the `coward` job calls the `spin180` job in several
different circumstances.

    create job coward
        look monster
        if no forward
        if yes spin180
        
        move right
        look monster
        if yes spin180
        if yes repeat 
        
        left
        left
        look monster
        if yes spin180
        if yes repeat 
        
        repeat
    end job coward
    
    create job spin180
        move left
        move left
        finish job
    end job spin180

This job will visit every tile in the whole level. It uses `setmark` to keep
track of the spots it has already visited, and then uses `touch mark` to make
sure it doesn't visit the same spots twice.

    create job search
        
        touch wall
        if yes finish
        
        touch mark
        if yes finish
        
        forward
        setmark
        do search
         
        right
        do search
        
        left
        left
        do search
        
        right
        backward
    end job search
