import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { GameEventsService } from './game-events.service';
import { CreateGameEventDto } from './dto/create-game-event.dto';
import { UpdateGameEventDto } from './dto/update-game-event.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Game Events')
@Controller(['api/eventi', 'api/game-events'])
export class GameEventsController {
  constructor(private readonly gameEventsService: GameEventsService) {}

  @Get()
  @ApiOperation({ summary: 'Ottieni tutti gli eventi attivi' })
  @ApiResponse({ status: 200, description: 'Lista di tutti gli eventi attivi' })
  findAll() {
    return this.gameEventsService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Ottieni eventi futuri' })
  @ApiResponse({ status: 200, description: 'Lista degli eventi futuri' })
  findUpcoming() {
    return this.gameEventsService.findUpcoming();
  }

  @Get('past')
  @ApiOperation({ summary: 'Ottieni eventi passati' })
  @ApiResponse({ status: 200, description: 'Lista degli eventi passati' })
  findPast() {
    return this.gameEventsService.findPast();
  }

  @Get('history')
  @ApiOperation({ summary: 'Ottieni storico eventi chiusi con classifiche' })
  @ApiResponse({ status: 200, description: 'Storico degli eventi terminati' })
  getHistory() {
    return this.gameEventsService.getHistory();
  }

  @Get('history/:eventId/team-rankings')
  @ApiOperation({ summary: 'Ottieni classifica squadre per evento specifico' })
  @ApiResponse({ status: 200, description: 'Classifica squadre dell\'evento' })
  getEventTeamRankings(@Param('eventId') eventId: string) {
    return this.gameEventsService.getEventTeamRankings(+eventId);
  }

  @Get('history/:eventId/player-rankings')
  @ApiOperation({ summary: 'Ottieni classifica giocatori per evento specifico' })
  @ApiResponse({ status: 200, description: 'Classifica giocatori dell\'evento' })
  getEventPlayerRankings(@Param('eventId') eventId: string) {
    return this.gameEventsService.getEventPlayerRankings(+eventId);
  }

  @Get('history/:eventId/snapshots')
  @ApiOperation({ summary: 'Ottieni snapshot delle classifiche per evento chiuso' })
  @ApiResponse({ status: 200, description: 'Snapshot delle classifiche salvate alla chiusura dell\'evento' })
  getEventRankingsFromSnapshot(@Param('eventId') eventId: string) {
    return this.gameEventsService.getEventRankingsFromSnapshot(+eventId);
  }

  @Get('debug/:eventId/status')
  @ApiOperation({ summary: 'Debug: mostra lo stato dei dati per un evento (Admin only)' })
  @ApiResponse({ status: 200, description: 'Informazioni di debug sull\'evento' })
  async debugEventStatus(@Param('eventId') eventId: string) {
    return this.gameEventsService.debugEventStatus(+eventId);
  }

  @Post('debug/:eventId/rebuild-scores')
  @ApiOperation({ summary: 'Debug: ricalcola tutti i punteggi per un evento (Admin only)' })
  @ApiResponse({ status: 200, description: 'Punteggi ricalcolati con successo' })
  async rebuildEventScores(@Param('eventId') eventId: string) {
    return this.gameEventsService.rebuildEventScores(+eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ottieni un evento specifico' })
  @ApiResponse({ status: 200, description: 'Dettagli dell\'evento' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  findOne(@Param('id') id: string) {
    return this.gameEventsService.findOne(+id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Crea un nuovo evento (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Evento creato con successo' })
  @ApiResponse({ status: 401, description: 'Autenticazione admin richiesta' })
  @ApiHeader({
    name: 'admin-password',
    description: 'Password admin per l\'autenticazione',
    required: true,
  })
  create(@Body() createGameEventDto: CreateGameEventDto) {
    return this.gameEventsService.create(createGameEventDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Aggiorna un evento (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Evento aggiornato con successo' })
  @ApiResponse({ status: 401, description: 'Autenticazione admin richiesta' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  @ApiHeader({
    name: 'admin-password',
    description: 'Password admin per l\'autenticazione',
    required: true,
  })
  update(@Param('id') id: string, @Body() updateGameEventDto: UpdateGameEventDto) {
    return this.gameEventsService.update(+id, updateGameEventDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Disattiva un evento (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Evento disattivato con successo' })
  @ApiResponse({ status: 401, description: 'Autenticazione admin richiesta' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  @ApiHeader({
    name: 'admin-password',
    description: 'Password admin per l\'autenticazione',
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.gameEventsService.remove(+id);
  }

  @Delete(':id/permanent')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Elimina permanentemente un evento (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Evento eliminato permanentemente' })
  @ApiResponse({ status: 401, description: 'Autenticazione admin richiesta' })
  @ApiResponse({ status: 404, description: 'Evento non trovato' })
  @ApiHeader({
    name: 'admin-password',
    description: 'Password admin per l\'autenticazione',
    required: true,
  })
  removePermanently(@Param('id') id: string) {
    return this.gameEventsService.removeCompletely(+id);
  }


}