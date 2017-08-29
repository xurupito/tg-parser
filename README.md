# TG Redes Sociais

TCC analisando dados do TSE e verificando possíveis relações entre partidos ao longo das eleições com conceitos de Redes Sociais.

#### Todo:
- [ ] Montar o grafo no formato *.gexf*
- [ ] Arquivos de 1998 não contém dados sobre composição de coligação, porém, é possível obter a sigla de algumas coligações. Então, quando não tivermos a composição da coligação, usar essa sigla para ir montando as coligações.

#### Bugs Conhecidos:
* ~~Algumas arestas estão ficando com peso > 27, o que é impossível, visto que temos somente 27 unidades federativas. O erro deve estar acontecendo pois na hora de montar o grafo, uma aresta é vista mais de uma vez dentro do mesmo estado, sendo então incrementado o seu peso. Quando uma aresta for incluída para uma UF, deve ser ignorada qualquer outra ocorrência da mesma aresta dentro do mesmo estado.~~
