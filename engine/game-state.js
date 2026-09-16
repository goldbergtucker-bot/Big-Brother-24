(function(){
  window.GameState={
    createInitialState:function(config){return {version:1,season:{id:config.id,number:24,originalYear:2022},houseguests:[],history:[],currentEventIndex:-1};},
    activePlayers:function(state){return (state.houseguests||[]).filter(h=>h.active);}
  };
})();
