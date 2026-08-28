CC = cc
CFLAGS = -Wall -Wextra -O2

credis: server.c
	$(CC) $(CFLAGS) -o credis server.c

test: credis
	./test.sh

clean:
	rm -f credis
